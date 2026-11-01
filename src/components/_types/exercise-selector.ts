export type ExerciseSelectorProps<T extends string> = {
  exercise: T;
  options: readonly T[];
  isOpen: boolean;
  onToggle: () => void;
  onChange: (exercise: T) => void;
  desktop?: boolean;
};
