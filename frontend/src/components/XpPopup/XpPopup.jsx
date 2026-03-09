import { useCallback, useMemo, useState } from 'react';

const POPUP_LIFETIME_MS = 900;

export function useXpPopups() {
  const [popups, setPopups] = useState([]);

  const spawnXp = useCallback((value, x, y) => {
    const id = `${Date.now()}-${Math.random()}`;
    const popup = { id, value, x, y };

    setPopups((prev) => [...prev, popup]);
    setTimeout(() => {
      setPopups((prev) => prev.filter((p) => p.id !== id));
    }, POPUP_LIFETIME_MS);
  }, []);

  const PopupLayer = useMemo(
    () =>
      function PopupLayerComponent() {
        return (
          <div className="xp-popup-layer" aria-hidden="true">
            {popups.map((p) => (
              <div
                key={p.id}
                className="xp-popup-item"
                style={{ left: `${p.x}px`, top: `${p.y}px` }}>
                +{p.value} XP
              </div>
            ))}
          </div>
        );
      },
    [popups]
  );

  return { spawnXp, PopupLayer };
}
