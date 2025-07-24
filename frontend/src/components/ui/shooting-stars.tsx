"use client";
import { cn } from "../../libs/utils";
import React, { useEffect, useState, useRef } from "react";

interface ShootingStar {
  id: number;
  x: number;
  y: number;
  angle: number;
  scale: number;
  speed: number;
  distance: number;
}

interface ShootingStarsProps {
  minSpeed?: number;
  maxSpeed?: number;
  minDelay?: number;
  maxDelay?: number;
  starColor?: string;
  trailColor?: string;
  starWidth?: number;
  starHeight?: number;
  className?: string;
}

const getRandomStartPoint = () => {
  const side = Math.floor(Math.random() * 4);
  const offset = Math.random() * window.innerWidth;

  switch (side) {
    case 0:
      return { x: offset, y: 0, angle: 45 };
    case 1:
      return { x: window.innerWidth, y: offset, angle: 135 };
    case 2:
      return { x: offset, y: window.innerHeight, angle: 225 };
    case 3:
      return { x: 0, y: offset, angle: 315 };
    default:
      return { x: 0, y: 0, angle: 45 };
  }
};

export const ShootingStars: React.FC<ShootingStarsProps> = ({
  minSpeed = 10,
  maxSpeed = 20,
  minDelay = 200,
  maxDelay = 800,
  starColor = "#9E00FF",
  trailColor = "#2EB9DF",
  starWidth = 10,
  starHeight = 1,
  className,
}) => {
  const [stars, setStars] = useState<ShootingStar[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    let isCancelled = false;

    const createStar = () => {
      if (isCancelled) return;

      const { x, y, angle } = getRandomStartPoint();
      const newStar: ShootingStar = {
        id: Date.now() + Math.random(),
        x,
        y,
        angle,
        scale: 1,
        speed: Math.random() * (maxSpeed - minSpeed) + minSpeed,
        distance: 0,
      };

      setStars((prev) => [...prev, newStar]);

      const nextDelay = Math.random() * (maxDelay - minDelay) + minDelay;
      setTimeout(createStar, nextDelay);
    };

    for (let i = 0; i < 5; i++) {
      setTimeout(createStar, i * 300); // 5x parallel
    }

    return () => {
      isCancelled = true;
    };
  }, [minSpeed, maxSpeed, minDelay, maxDelay]);

  useEffect(() => {
    let animationFrame: number;

    const moveStars = () => {
      setStars((prevStars) =>
        prevStars
          .map((star) => {
            const newX =
              star.x + star.speed * Math.cos((star.angle * Math.PI) / 180);
            const newY =
              star.y + star.speed * Math.sin((star.angle * Math.PI) / 180);
            const newDistance = star.distance + star.speed;
            const newScale = 1 + newDistance / 100;

            if (
              newX < -50 ||
              newX > window.innerWidth + 50 ||
              newY < -50 ||
              newY > window.innerHeight + 50
            ) {
              return null; // remove star
            }

            return {
              ...star,
              x: newX,
              y: newY,
              distance: newDistance,
              scale: newScale,
            };
          })
          .filter((star): star is ShootingStar => star !== null)
      );

      animationFrame = requestAnimationFrame(moveStars);
    };

    animationFrame = requestAnimationFrame(moveStars);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <svg
      ref={svgRef}
      className={cn("w-full h-full absolute inset-0", className)}
    >
      <defs>
        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: trailColor, stopOpacity: 0 }} />
          <stop
            offset="100%"
            style={{ stopColor: starColor, stopOpacity: 1 }}
          />
        </linearGradient>
      </defs>

      {stars.map((star) => (
        <rect
          key={star.id}
          x={star.x}
          y={star.y}
          width={starWidth * star.scale}
          height={starHeight}
          fill="url(#gradient)"
          transform={`rotate(${star.angle}, ${
            star.x + (starWidth * star.scale) / 2
          }, ${star.y + starHeight / 2})`}
        />
      ))}
    </svg>
  );
};

