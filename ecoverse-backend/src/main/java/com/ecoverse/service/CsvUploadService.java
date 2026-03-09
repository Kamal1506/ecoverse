package com.ecoverse.service;

import com.ecoverse.entity.Question;
import com.ecoverse.entity.Quiz;
import com.ecoverse.repository.QuizRepository;
import com.ecoverse.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class CsvUploadService {

    private final QuizRepository     quizRepository;
    private final QuestionRepository questionRepository;

    // Expected CSV header — exactly this, case-insensitive
    private static final String[] EXPECTED_HEADERS = {
        "quiztitle", "question", "optiona", "optionb", "optionc", "optiond", "correctoption"
    };

    // ── Main upload method ────────────────────────────────────────────────────
    // @Transactional = if ANY row fails, the ENTIRE upload is rolled back
    // No partial imports — all or nothing
    @Transactional
    public CsvUploadResult uploadFromCsv(MultipartFile file) {

        // ── Validation ───────────────────────────────────────────────────────
        validateFile(file);

        List<String[]> rows   = parseFile(file);
        validateHeaders(rows.get(0));

        // ── Parse rows into grouped structure: title → list of question rows ─
        // LinkedHashMap preserves insertion order so quizzes appear in CSV order
        Map<String, List<String[]>> grouped = new LinkedHashMap<>();

        int skippedRows = 0;
        for (int i = 1; i < rows.size(); i++) {   // start at 1 to skip header
            String[] cols = rows.get(i);

            // Skip blank or incomplete rows silently
            if (cols.length < 7 || isBlankRow(cols)) {
                skippedRows++;
                continue;
            }

            String title = cols[0].trim();
            if (title.isEmpty()) {
                skippedRows++;
                continue;
            }

            grouped.computeIfAbsent(title, k -> new ArrayList<>()).add(cols);
        }

        if (grouped.isEmpty()) {
            throw new IllegalArgumentException(
                "CSV has no valid data rows. Check your file format.");
        }

        // ── Create Quiz + Questions ──────────────────────────────────────────
        int quizzesCreated   = 0;
        int questionsCreated = 0;
        List<String> skippedQuizzes = new ArrayList<>();

        for (Map.Entry<String, List<String[]>> entry : grouped.entrySet()) {
            String      title       = entry.getKey();
            List<String[]> questionRows = entry.getValue();

            // Skip duplicate quiz titles that already exist in DB
            if (quizRepository.existsByTitle(title)) {
                log.warn("Skipping duplicate quiz title: '{}'", title);
                skippedQuizzes.add(title);
                continue;
            }

            // Build and save Quiz
            Quiz quiz = Quiz.builder()
                    .title(title)
                    .description("Uploaded via CSV")
                    .xpReward(100)
                    .build();
            quiz = quizRepository.save(quiz);

            // Build and save Questions
            List<Question> questions = new ArrayList<>();
            for (String[] cols : questionRows) {
                String correctOption = cols[6].trim().toUpperCase();

                // Validate correctOption is A/B/C/D
                if (!correctOption.matches("[ABCD]")) {
                    throw new IllegalArgumentException(
                        "Row has invalid correctOption '" + cols[6].trim() +
                        "' for quiz '" + title + "'. Must be A, B, C, or D.");
                }

                questions.add(Question.builder()
                        .quiz(quiz)
                        .questionText(cols[1].trim())
                        .optionA(cols[2].trim())
                        .optionB(cols[3].trim())
                        .optionC(cols[4].trim())
                        .optionD(cols[5].trim())
                        .correctOption(correctOption)
                        .build());
            }

            questionRepository.saveAll(questions);
            quizzesCreated++;
            questionsCreated += questions.size();

            log.info("CSV: Created quiz '{}' with {} questions", title, questions.size());
        }

        return new CsvUploadResult(quizzesCreated, questionsCreated, skippedRows, skippedQuizzes);
    }

    // ── File validation ───────────────────────────────────────────────────────
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty. Please upload a CSV file.");
        }

        String filename = file.getOriginalFilename();
        if (filename == null || !filename.toLowerCase().endsWith(".csv")) {
            throw new IllegalArgumentException(
                "Invalid file type. Only .csv files are accepted.");
        }

        // 5MB max
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException(
                "File too large. Maximum size is 5MB.");
        }
    }

    // ── Parse CSV file into rows ──────────────────────────────────────────────
    private List<String[]> parseFile(MultipartFile file) {
        List<String[]> rows = new ArrayList<>();
        try (BufferedReader reader = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {

            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty()) continue;

                // Handle quoted CSV values properly
                String[] cols = parseCsvLine(line);
                rows.add(cols);
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to read CSV file: " + e.getMessage());
        }

        if (rows.size() < 2) {
            throw new IllegalArgumentException(
                "CSV must have a header row and at least one data row.");
        }

        return rows;
    }

    // ── Validate CSV headers ──────────────────────────────────────────────────
    private void validateHeaders(String[] headerRow) {
        if (headerRow.length < 7) {
            throw new IllegalArgumentException(
                "CSV must have 7 columns: quizTitle, question, optionA, optionB, optionC, optionD, correctOption");
        }

        for (int i = 0; i < EXPECTED_HEADERS.length; i++) {
            String actual   = headerRow[i].trim().toLowerCase().replaceAll("[^a-z]", "");
            String expected = EXPECTED_HEADERS[i];
            if (!actual.equals(expected)) {
                throw new IllegalArgumentException(
                    "Column " + (i + 1) + " header mismatch. Expected '" +
                    EXPECTED_HEADERS[i] + "' but got '" + headerRow[i].trim() + "'.");
            }
        }
    }

    // ── Parse a single CSV line handling quoted fields ────────────────────────
    private String[] parseCsvLine(String line) {
        List<String> cols  = new ArrayList<>();
        StringBuilder curr = new StringBuilder();
        boolean inQuotes   = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);

            if (c == '"') {
                // Toggle quote mode; handle escaped quotes ("")
                if (inQuotes && i + 1 < line.length() && line.charAt(i + 1) == '"') {
                    curr.append('"');
                    i++;
                } else {
                    inQuotes = !inQuotes;
                }
            } else if (c == ',' && !inQuotes) {
                cols.add(curr.toString());
                curr.setLength(0);
            } else {
                curr.append(c);
            }
        }
        cols.add(curr.toString());   // last field

        return cols.toArray(new String[0]);
    }

    // ── Check if a row is completely blank ────────────────────────────────────
    private boolean isBlankRow(String[] cols) {
        for (String col : cols) {
            if (col != null && !col.trim().isEmpty()) return false;
        }
        return true;
    }

    // ── Result DTO ────────────────────────────────────────────────────────────
    public record CsvUploadResult(
        int quizzesCreated,
        int questionsCreated,
        int skippedRows,
        List<String> skippedDuplicateTitles
    ) {}
}