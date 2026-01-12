import type { GemId } from '../../types/gems';
import { getAllGems } from '../../workers/utils/gemData';

interface GemSelectorProps {
  selectedGems: Set<GemId>;
  gemRanks: Partial<Record<GemId, number>>;
  onToggle: (gemId: GemId) => void;
  onRankChange: (gemId: GemId, rank: number) => void;
}

export function GemSelector({ selectedGems, gemRanks, onToggle, onRankChange }: GemSelectorProps) {
  const gems = getAllGems();

  return (
    <div className="section-card">
      <h2 className="text-2xl font-bold text-primary mb-4">Select Gems</h2>
      <p className="text-gray-400 text-sm mb-4">
        Click gems to select them. Selected gems will be used in DPS calculations.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {gems.map((gem) => {
          const isSelected = selectedGems.has(gem.id as GemId);
          const rank = gemRanks[gem.id as GemId] || 10;

          return (
            <div
              key={gem.id}
              className={`gem-card ${isSelected ? 'active' : ''}`}
              onClick={() => onToggle(gem.id as GemId)}
              data-testid={`gem-${gem.id}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-white mb-1">
                    {gem.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {'⭐'.repeat(gem.stars)} • {gem.category.toUpperCase()}
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  onClick={(e) => e.stopPropagation()}
                  className="w-5 h-5 text-primary focus:ring-primary rounded"
                />
              </div>

              {isSelected && (
                <div className="mt-3 pt-3 border-t border-gray-600" onClick={(e) => e.stopPropagation()}>
                  <label className="text-xs text-gray-400 block mb-1">
                    Rank: {rank}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={rank}
                    onChange={(e) => onRankChange(gem.id as GemId, parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-sm text-gray-400">
        <span className="font-semibold text-accent">{selectedGems.size}</span> gems selected
      </div>
    </div>
  );
}
