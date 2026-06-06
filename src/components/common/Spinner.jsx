/**
 * components/common/Spinner.jsx
 *
 * Reusable loading indicator.
 *  - size: 'sm' | 'md' | 'lg'
 *  - fullPage: centres the spinner in the viewport
 *
 * Usage:
 *   <Spinner />                    inline, medium
 *   <Spinner size="lg" fullPage /> centred full-viewport
 */

const sizeMap = {
  sm: '20px',
  md: '36px',
  lg: '56px',
};

function Spinner({ size = 'md', fullPage = false }) {
  const dimension = sizeMap[size] || sizeMap.md;

  const spinner = (
    <div
      role="status"
      aria-label="Loading"
      style={{
        width:        dimension,
        height:       dimension,
        border:       '3px solid rgba(100, 108, 255, 0.2)',
        borderTop:    '3px solid #646cff',
        borderRadius: '50%',
        animation:    'spin 0.7s linear infinite',
      }}
    />
  );

  // Keyframe injected inline — avoids a separate CSS file dependency.
  const keyframes = <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>;

  if (fullPage) {
    return (
      <div
        style={{
          display:        'flex',
          justifyContent: 'center',
          alignItems:     'center',
          minHeight:      '60vh',
        }}
      >
        {spinner}
        {keyframes}
      </div>
    );
  }

  return (
    <>
      {spinner}
      {keyframes}
    </>
  );
}

export default Spinner;
