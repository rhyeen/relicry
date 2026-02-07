import { Slider } from '@base-ui/react';
import styles from "./DSSlider.module.css";
import DSField from './DSField';

type DSSliderProps = Readonly<{
  min?: number;
  max?: number;
  step?: number;
  label?: string;
}>;

type DSSliderRootProps = Readonly<DSSliderProps & {
  value: number | number[];
  onValueChange: (value: number | number[]) => void;
  thumbAriaLabel?: string | string[];
  thumbCount: 1 | 2;
}>;

function DSSliderRoot({ value, label, thumbAriaLabel, onValueChange, thumbCount, min, max, step }: DSSliderRootProps) {
  const slider = (
    <Slider.Root
      className={styles.root}
      value={value}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
    >
      <Slider.Control className={styles.control}>
        <Slider.Track className={styles.track}>
          <Slider.Indicator className={styles.indicator} />
          <Slider.Thumb className={styles.thumb} aria-label={Array.isArray(thumbAriaLabel) ? thumbAriaLabel[0] : thumbAriaLabel} index={0} />
          {thumbCount === 2 && <Slider.Thumb className={styles.thumb} aria-label={Array.isArray(thumbAriaLabel) ? thumbAriaLabel[1] : thumbAriaLabel} index={1} />}
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  );
  if (label) {
    return (
      <DSField.Root>
        <DSField.Label label={label} />
        {slider}
      </DSField.Root>
    );
  } else {
    return slider;
  }
}

type DSSliderSingleProps = Readonly<DSSliderProps & {
  value: number;
  thumbAriaLabel?: string;
  onValueChange?: (value: number) => void;
}>;

function DSSliderSingle(props: DSSliderSingleProps) {
  return (
    <DSSliderRoot
      {...props}
      onValueChange={(value) => props.onValueChange?.(value as number)}
      thumbCount={1}
    />
  );
}

type DSSliderRangeProps = Readonly<DSSliderProps & {
  value: [number, number];
  thumbAriaLabel?: [string, string];
  onValueChange?: (value: [number, number]) => void;
}>;

function DSSliderRange(props: DSSliderRangeProps) {
  return (
    <DSSliderRoot
      {...props}
      onValueChange={(value) => props.onValueChange?.(value as [number, number])}
      thumbCount={2}
    />
  );
}

const DSSlider = Object.assign(DSSliderRoot, {
  Single: DSSliderSingle,
  Range: DSSliderRange,
});

export default DSSlider;
