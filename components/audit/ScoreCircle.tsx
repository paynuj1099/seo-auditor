'use client';

interface ScoreCircleProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  showLetterGrade?: boolean;
}

const getLetterGrade = (score: number): string => {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'F';
};

export default function ScoreCircle({ score, size = 'medium', showLetterGrade = false }: ScoreCircleProps) {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-40 h-40',
  };

  const textClasses = {
    small: 'text-xl',
    medium: 'text-3xl',
    large: 'text-5xl',
  };

  const getColor = () => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStrokeColor = () => {
    if (score >= 90) return '#16a34a';
    if (score >= 75) return '#2563eb';
    if (score >= 50) return '#ca8a04';
    return '#dc2626';
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const letterGrade = getLetterGrade(score);

  return (
    <div className={`relative ${sizeClasses[size]}`}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-navy-100"
        />
        <circle
          cx="50%"
          cy="50%"
          r="45%"
          stroke={getStrokeColor()}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`font-bold ${textClasses[size]} ${getColor()}`}>
          {showLetterGrade ? letterGrade : score}
        </span>
      </div>
    </div>
  );
}
