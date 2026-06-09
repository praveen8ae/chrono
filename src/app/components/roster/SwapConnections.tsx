import { useEffect, useState } from 'react';
import { useRosterStore } from '../../store/rosterStore';

type Connection = {
  id: string;
  path: string;
};

export function SwapConnections() {
  const { swaps } = useRosterStore();
  const [connections, setConnections] = useState<Connection[]>([]);
  const [containerBounds, setContainerBounds] = useState({ top: 0, left: 0, width: 0, height: 0 });

  useEffect(() => {
    const updateConnections = () => {
      const container = document.getElementById('roster-grid-container');
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      setContainerBounds({
        top: containerRect.top + window.scrollY,
        left: containerRect.left + window.scrollX,
        width: containerRect.width,
        height: containerRect.height
      });

      const newConnections: Connection[] = [];

      swaps.forEach((swap) => {
        const cell1 = document.querySelector(
          `[data-employee-id="${swap.employee1Id}"][data-date="${swap.employee1Date}"]`
        ) as HTMLElement;
        const cell2 = document.querySelector(
          `[data-employee-id="${swap.employee2Id}"][data-date="${swap.employee2Date}"]`
        ) as HTMLElement;

        if (cell1 && cell2) {
          const rect1 = cell1.getBoundingClientRect();
          const rect2 = cell2.getBoundingClientRect();

          // S bubble positions
          const bubble1X = rect1.right - 6 - containerRect.left;
          const bubble1Y = rect1.top + 6 - containerRect.top;
          const bubble2X = rect2.right - 6 - containerRect.left;
          const bubble2Y = rect2.top + 6 - containerRect.top;

          const cornerRadius = 4;

          // Table border positions - the actual grid lines
          // Vertical borders are at the right edge (border-right of cells)
          const verticalBorder1 = rect1.right - containerRect.left - 0.5; // Center of 1px border
          const verticalBorder2 = rect2.right - containerRect.left - 0.5;

          // Horizontal border between the two rows
          const goingDown = rect2.top > rect1.top;
          const horizontalBorder = goingDown ?
            rect1.bottom - containerRect.top - 0.5 : // Center of border below cell1
            rect1.top - containerRect.top + 0.5; // Center of border above cell1

          let path = '';

          // Start at S bubble
          path += `M ${bubble1X} ${bubble1Y} `;

          // Go to vertical border line
          path += `L ${verticalBorder1} ${bubble1Y} `;

          // Travel along vertical border to horizontal border with rounded corner
          if (goingDown) {
            path += `L ${verticalBorder1} ${horizontalBorder - cornerRadius} `;
            path += `Q ${verticalBorder1} ${horizontalBorder}, ${verticalBorder1 - cornerRadius} ${horizontalBorder} `;
          } else {
            path += `L ${verticalBorder1} ${horizontalBorder + cornerRadius} `;
            path += `Q ${verticalBorder1} ${horizontalBorder}, ${verticalBorder1 - cornerRadius} ${horizontalBorder} `;
          }

          // Travel along horizontal border between rows
          path += `L ${verticalBorder2 + cornerRadius} ${horizontalBorder} `;

          // Turn onto vertical border with rounded corner
          if (goingDown) {
            path += `Q ${verticalBorder2} ${horizontalBorder}, ${verticalBorder2} ${horizontalBorder + cornerRadius} `;
          } else {
            path += `Q ${verticalBorder2} ${horizontalBorder}, ${verticalBorder2} ${horizontalBorder - cornerRadius} `;
          }

          // Travel along vertical border to destination
          path += `L ${verticalBorder2} ${bubble2Y} `;

          // Go to destination S bubble
          path += `L ${bubble2X} ${bubble2Y}`;

          newConnections.push({
            id: swap.id,
            path: path.trim()
          });
        }
      });

      setConnections(newConnections);
    };

    // Initial update with delay to ensure DOM is ready
    setTimeout(updateConnections, 100);

    // Update on scroll or resize
    const handleUpdate = () => {
      requestAnimationFrame(updateConnections);
    };

    window.addEventListener('scroll', handleUpdate, true);
    window.addEventListener('resize', handleUpdate);

    // Update periodically in case of layout changes
    const interval = setInterval(updateConnections, 500);

    return () => {
      window.removeEventListener('scroll', handleUpdate, true);
      window.removeEventListener('resize', handleUpdate);
      clearInterval(interval);
    };
  }, [swaps]);

  if (connections.length === 0) return null;

  return (
    <svg
      className="absolute pointer-events-none"
      style={{
        top: 0,
        left: 0,
        width: containerBounds.width,
        height: containerBounds.height,
        zIndex: 20
      }}
    >
      {connections.map((conn) => (
        <g key={conn.id}>
          {/* Background path for visibility */}
          <path
            d={conn.path}
            stroke="#fff"
            strokeWidth="2.5"
            fill="none"
            opacity="0.7"
          />
          {/* Main colored path */}
          <path
            d={conn.path}
            stroke="#f97316"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="4,2"
          />
        </g>
      ))}
    </svg>
  );
}
