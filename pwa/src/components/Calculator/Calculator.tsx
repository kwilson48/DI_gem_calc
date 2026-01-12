import { useCalculatorStore } from '../../stores/calculatorStore';
import { GemSelector } from './GemSelector';
import { CharacterStats } from './CharacterStats';
import { ResultsDisplay } from './ResultsDisplay';

export function Calculator() {
  const {
    selectedGems,
    gemRanks,
    toggleGem,
    setGemRank,
    characterStats,
    setCharacterStats,
    buildOptions,
    setBuildOptions,
    calculate,
    calculationResult,
    isCalculating,
    error,
    reset
  } = useCalculatorStore();

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      {/* Header */}
      <header className="text-center mb-8 pt-6">
        <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary mb-2">
          Gem Calculator v8.0
        </h1>
        <p className="text-gray-400 text-lg">PWA Edition - Works Offline</p>
        <p className="text-gray-500 text-sm mt-2">
          Diablo Immortal - Complete gem build optimizer
        </p>
      </header>

      {/* Gem Selection */}
      <GemSelector
        selectedGems={selectedGems}
        gemRanks={gemRanks}
        onToggle={toggleGem}
        onRankChange={setGemRank}
      />

      {/* Character Stats */}
      <CharacterStats stats={characterStats} onChange={setCharacterStats} />

      {/* Build Options */}
      <div className="section-card">
        <h2 className="text-2xl font-bold text-purple mb-4">Build Options</h2>
        <div className="flex gap-6">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={buildOptions.useStrife}
              onChange={(e) => setBuildOptions({ useStrife: e.target.checked })}
              className="w-5 h-5 text-strife focus:ring-strife rounded"
            />
            <div>
              <div className="text-white font-medium">Use Strife</div>
              <div className="text-xs text-gray-400">
                All gem values reduced to 1/3 in Strife mode
              </div>
            </div>
          </label>

          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={buildOptions.useFatedTrail}
              onChange={(e) => setBuildOptions({ useFatedTrail: e.target.checked })}
              className="w-5 h-5 text-accent focus:ring-accent rounded"
            />
            <div>
              <div className="text-white font-medium">Fated Trail Active</div>
              <div className="text-xs text-gray-400">
                Include Fated Trail gem calculations
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* Calculate Button */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={calculate}
          disabled={isCalculating || selectedGems.size === 0}
          className="btn-primary px-12 py-4 text-xl"
          data-testid="calculate-button"
        >
          {isCalculating ? (
            <span className="flex items-center gap-2">
              <span className="inline-block animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
              Calculating...
            </span>
          ) : (
            `Calculate DPS (${selectedGems.size} gems)`
          )}
        </button>

        <button
          onClick={reset}
          className="btn-secondary px-8 py-4 text-xl"
        >
          Reset
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="section-card bg-red-900/20 border-red-500">
          <p className="text-red-400 font-medium">⚠️ Error: {error}</p>
        </div>
      )}

      {/* Results */}
      <ResultsDisplay result={calculationResult} isCalculating={isCalculating} />

      {/* Footer */}
      <footer className="text-center text-gray-500 text-sm py-8">
        <p>
          Offline-capable PWA • All calculations run locally on your device
        </p>
        <p className="mt-2">
          Based on Diablo Immortal v7.1 Fated Trail Update
        </p>
      </footer>
    </div>
  );
}
