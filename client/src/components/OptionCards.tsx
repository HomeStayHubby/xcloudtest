import styles from './OptionCards.module.css';

export type Option = {
  id: string;
  text: string;
};

export type OptionCardsProps = {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multi?: boolean;
  disabled?: boolean;
};

export default function OptionCards({
  options,
  selected,
  onChange,
  multi = false,
  disabled = false,
}: OptionCardsProps): JSX.Element {
  function toggle(id: string) {
    if (disabled) return;
    if (multi) {
      if (selected.includes(id)) {
        onChange(selected.filter((x) => x !== id));
      } else {
        onChange([...selected, id]);
      }
    } else {
      onChange([id]);
    }
  }

  return (
    <div className={styles.options} role="group">
      {options.map((opt) => {
        const isSelected = selected.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            className={`${styles.option} ${isSelected ? styles.selected : ''} ${disabled ? styles.disabled : ''}`}
            onClick={() => toggle(opt.id)}
            disabled={disabled}
          >
            <span className={styles.bubble}>{isSelected ? <span className={styles.check}>✓</span> : null}</span>
            <span className={styles.text}>{opt.text}</span>
          </button>
        );
      })}
    </div>
  );
}
