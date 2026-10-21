declare module '*.geojson' {
  const data: {
    type: 'FeatureCollection';
    features: Array<{
      type: 'Feature';
      id: string;
      properties: Record<string, unknown>;
      geometry: { type: 'LineString'; coordinates: Array<[number, number]> };
    }>;
  };
  export default data;
}
