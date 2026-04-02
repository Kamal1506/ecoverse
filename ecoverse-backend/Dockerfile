FROM maven:3.9.9-eclipse-temurin-21

WORKDIR /app

COPY . .

RUN mvn clean package

CMD ["java", "-jar", "target/ecoverse-backend-0.0.1-SNAPSHOT.jar"]