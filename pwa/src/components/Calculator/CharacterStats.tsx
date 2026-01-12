import type { CharacterStats as Stats } from '../../types/gems';

interface CharacterStatsProps {
  stats: Stats;
  onChange: (stats: Partial<Stats>) => void;
}

export function CharacterStats({ stats, onChange }: CharacterStatsProps) {
  return (
    <div className="section-card">
      <h2 className="text-2xl font-bold text-accent mb-4">Character Stats</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Basic Stats */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Base Damage</label>
          <input
            type="number"
            value={stats.baseDamage}
            onChange={(e) => onChange({ baseDamage: parseFloat(e.target.value) || 0 })}
            className="input-field"
            placeholder="1000"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Attack Speed</label>
          <input
            type="number"
            step="0.1"
            value={stats.attackSpeed}
            onChange={(e) => onChange({ attackSpeed: parseFloat(e.target.value) || 1 })}
            className="input-field"
            placeholder="1.4"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Enemy Count</label>
          <input
            type="number"
            min="1"
            value={stats.enemyCount}
            onChange={(e) => onChange({ enemyCount: parseInt(e.target.value) || 1 })}
            className="input-field"
            placeholder="1"
          />
        </div>

        {/* Crit Stats */}
        <div>
          <label className="block text-sm text-gray-400 mb-2">Crit Chance (%)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            max="100"
            value={stats.critChance}
            onChange={(e) => onChange({ critChance: parseFloat(e.target.value) || 0 })}
            className="input-field"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Crit Damage (%)</label>
          <input
            type="number"
            step="0.1"
            min="0"
            value={stats.critDamage}
            onChange={(e) => onChange({ critDamage: parseFloat(e.target.value) || 0 })}
            className="input-field"
            placeholder="0"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Current Life (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={stats.currentLifePercent}
            onChange={(e) => onChange({ currentLifePercent: parseFloat(e.target.value) || 100 })}
            className="input-field"
            placeholder="100"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-400 mb-2">Primary Attack (%)</label>
          <input
            type="number"
            min="0"
            max="100"
            value={stats.primaryPercent}
            onChange={(e) => onChange({ primaryPercent: parseFloat(e.target.value) || 50 })}
            className="input-field"
            placeholder="50"
          />
        </div>
      </div>

      {/* Toggles */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-300 mb-3">Build Options</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: 'hasBuffSkill', label: 'Has Buff Skill' },
            { key: 'hasDashSkill', label: 'Has Dash Skill' },
            { key: 'hasVithus', label: 'Has Vithus' },
            { key: 'hasFeastingBaron', label: 'Has Feasting Baron' },
            { key: 'fightingElites', label: 'Fighting Elites' }
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={stats[key as keyof Stats] as boolean}
                onChange={(e) => onChange({ [key]: e.target.checked })}
                className="w-4 h-4 text-primary focus:ring-primary rounded"
              />
              <span className="text-sm text-gray-300">{label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
