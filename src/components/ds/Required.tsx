type RequiredProps = {
  required?: boolean;
  minimum?: number;
  maximum?: number;
  children: React.ReactNode;
};

export function Required({ required, children, minimum, maximum }: RequiredProps) {
  if (!required) return children;
  const getMarker = () => {
    if (!minimum) {
      if (maximum) return ` (max ${maximum})`;
      return required ? ' *' : '';
    } else {
      if (maximum) return ` (${minimum}-${maximum})`;
      return ` (${minimum}+)`;
    }
  };
  return (
    <>{children}<span style={{ color: 'var(--ds-color-danger)' }}>{getMarker()}</span></>
  );
}