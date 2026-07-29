import Svg, { Polygon, Line } from 'react-native-svg';

/**
 * The trackit package mark: a white isometric shipping box with a green
 * accent on the front face. Drawn as an SVG so it stays crisp and its
 * colors match the brand exactly (white facets, brand-green edge).
 */
export function BoxMark({ size = 60 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64">
      {/* right (front) face — most shaded */}
      <Polygon points="32,35 51,24 51,44 32,55" fill="#CBD2D9" />
      {/* left (front) face — mid shade */}
      <Polygon points="13,24 32,35 32,55 13,44" fill="#E7EBEF" />
      {/* top face — white */}
      <Polygon points="32,13 51,24 32,35 13,24" fill="#FFFFFF" />

      {/* facet seams for definition */}
      <Line x1="32" y1="13" x2="32" y2="35" stroke="#C3CAD1" strokeWidth={1.1} />
      <Line x1="32" y1="35" x2="32" y2="55" stroke="#B4BCC4" strokeWidth={1.1} />

      {/* green accent strip on the front-right face */}
      <Line x1="36" y1="40" x2="36" y2="53" stroke="#35C46E" strokeWidth={2.6} strokeLinecap="round" />
    </Svg>
  );
}
