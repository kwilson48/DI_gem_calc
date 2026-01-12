import type { CalculationResult } from '../../types/builds';

interface ResultsDisplayProps {
  result: CalculationResult | null;
  isCalculating: boolean;
}

export function ResultsDisplay({ result, isCalculating }: ResultsDisplayProps) {
  if (isCalculating) {
    return (
      <div className="section-card text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-400">Calculating DPS...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="section-card text-center text-gray-500">
        <p>Select gems and click Calculate to see DPS results</p>
      </div>
    );
  }

  return (
    <div className="section-card">
      <h2 className="text-2xl font-bold text-accent mb-4">Results</h2>

      {/* Total DPS - Hero Display */}
      <div className="bg-gradient-to-r from-primary/20 to-secondary/20 p-8 rounded-lg mb-6 text-center">
        <div className="text-gray-400 text-sm mb-2 uppercase tracking-wider">Total DPS</div>
        <div
          className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary"
          data-testid="total-dps"
        >
          {result.totalDPS.toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="result-stat">
          <div className="result-stat-label">Base DPS</div>
          <div className="result-stat-value text-general">
            {result.baseDPS.toLocaleString()}
          </div>
        </div>

        <div className="result-stat">
          <div className="result-stat-label">Legendary Bonus</div>
          <div className="result-stat-value text-legendary">
            +{result.breakdown.totalLegBonus.toFixed(1)}%
          </div>
        </div>

        <div className="result-stat">
          <div className="result-stat-label">Direct DPS</div>
          <div className="result-stat-value text-efficiency">
            {result.breakdown.totalDirectDPS.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Gem Contributions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-300 mb-3">Gem Contributions</h3>
        <div className="space-y-2">
          {Object.entries(result.breakdown.gemContributions).map(([gemId, contribution]) => (
            <div
              key={gemId}
              className="bg-gray-800 p-3 rounded-lg flex justify-between items-center"
            >
              <div>
                <div className="text-sm font-medium text-white">{gemId}</div>
                <div className="text-xs text-gray-400">{contribution.description}</div>
              </div>
              <div className="text-right">
                {contribution.legBonus > 0 && (
                  <div className="text-sm text-legendary">
                    +{contribution.legBonus.toFixed(1)}%
                  </div>
                )}
                {contribution.directDPS > 0 && (
                  <div className="text-sm text-efficiency">
                    {Math.round(contribution.directDPS).toLocaleString()} DPS
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metadata */}
      <div className="mt-6 text-xs text-gray-500 text-center">
        Calculated in {result.metadata.calculationTime}ms •
        {new Date(result.metadata.calculatedAt).toLocaleTimeString()}
      </div>
    </div>
  );
}
