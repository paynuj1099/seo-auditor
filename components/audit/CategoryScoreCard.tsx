'use client';

interface CategoryScoreCardProps {
  title: string;
  score: number;
  icon: 'search' | 'zap' | 'globe' | 'shield' | 'trending-up' | 'smartphone';
}

const getLetterGrade = (score: number): string => {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 75) return 'B';
  if (score >= 60) return 'C';
  if (score >= 45) return 'D';
  return 'F';
};

const getScoreColor = (score: number): string => {
  if (score >= 90) return '#16a34a'; // green
  if (score >= 75) return '#2563eb'; // blue
  if (score >= 60) return '#eab308'; // yellow
  if (score >= 45) return '#f97316'; // orange
  return '#dc2626'; // red
};

export default function CategoryScoreCard({ title, score, icon }: CategoryScoreCardProps) {
  const letterGrade = getLetterGrade(score);
  const color = getScoreColor(score);
  const circumference = 2 * Math.PI * 35;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="bg-white rounded-lg p-3 shadow-md border border-navy-100 hover:shadow-lg transition-shadow">
      <div className="flex flex-col items-center">
        {/* Circular Progress */}
        <div className="relative w-14 h-14 mb-1.5">
          <svg className="transform -rotate-90 w-full h-full">
            <circle
              cx="50%"
              cy="50%"
              r="35%"
              stroke="currentColor"
              strokeWidth="5"
              fill="none"
              className="text-navy-100"
            />
            <circle
              cx="50%"
              cy="50%"
              r="35%"
              stroke={color}
              strokeWidth="5"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold" style={{ color }}>
              {letterGrade}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[10px] font-semibold text-navy-900 text-center leading-tight">{title}</h3>
      </div>
    </div>
  );
}
