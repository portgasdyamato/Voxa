import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocity: {
    x: number;
    y: number;
  };
  rotationSpeed: number;
}

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

const PASTEL_COLORS = [
  '#FFB3BA', // Light pink
  '#BFBFFF', // Light purple
  '#BAE1FF', // Light blue
  '#FFFFBA', // Light yellow
  '#BAE1BA', // Light green
  '#FFDFBA', // Light orange
  '#E0BBE4', // Light lavender
  '#D4F1F4', // Light cyan
];

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (trigger && !isActive) {
      setIsActive(true);
      
      // Create confetti pieces
      const newPieces: ConfettiPiece[] = [];
      for (let i = 0; i < 50; i++) {
        newPieces.push({
          id: i,
          x: Math.random() * window.innerWidth,
          y: -10,
          rotation: Math.random() * 360,
          color: PASTEL_COLORS[Math.floor(Math.random() * PASTEL_COLORS.length)],
          size: Math.random() * 6 + 4,
          velocity: {
            x: (Math.random() - 0.5) * 4,
            y: Math.random() * 3 + 2,
          },
          rotationSpeed: (Math.random() - 0.5) * 6,
        });
      }
      setPieces(newPieces);

      // Animate confetti
      const animationDuration = 3000;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = elapsed / animationDuration;

        if (progress >= 1) {
          setIsActive(false);
          setPieces([]);
          onComplete?.();
          return;
        }

        setPieces(currentPieces =>
          currentPieces.map(piece => ({
            ...piece,
            x: piece.x + piece.velocity.x,
            y: piece.y + piece.velocity.y,
            rotation: piece.rotation + piece.rotationSpeed,
            velocity: {
              ...piece.velocity,
              y: piece.velocity.y + 0.1, // gravity
            },
          }))
        );

        requestAnimationFrame(animate);
      };

      requestAnimationFrame(animate);
    }
  }, [trigger, isActive, onComplete]);

  if (!isActive || pieces.length === 0) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 pointer-events-none z-50">
      {pieces.map(piece => (
        <div
          key={piece.id}
          className="absolute"
          style={{
            left: piece.x,
            top: piece.y,
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            transform: `rotate(${piece.rotation}deg)`,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
          }}
        />
      ))}
    </div>,
    document.body
  );
}
