import React from 'react';

interface CircularProgressBarProps {
  percentage: number;
  size: number;
  strokeWidth: number;
  circleOneStroke: string;
  circleTwoStroke: string;
}

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  percentage,
  size,
  strokeWidth,
  circleOneStroke,
  circleTwoStroke
}) => {
  const center = size / 2;
  const radius = size / 2 - strokeWidth / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <svg width={size} height={size}>
      <circle
        className="circular-progress-background"
        stroke={circleOneStroke}
        cx={center}
        cy={center}
        r={radius}
        strokeWidth={strokeWidth}
        fill="none"
      />
      <circle
        className="circular-progress"
        stroke={circleTwoStroke}
        cx={center}
        cy={center}
        r={radius}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        fill="none"
      />
      <text
        x="50%"
        y="50%"
        dy=".3em"
        textAnchor="middle"
        className="circular-progress-text"
        fill={circleTwoStroke}
        fontSize="16px"
        fontWeight="bold"
      >
        {`${Math.round(percentage)}%`}
      </text>
    </svg>
  );
};

export default CircularProgressBar;
