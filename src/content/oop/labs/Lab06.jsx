import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code } from '../../../components/ui';
import MultiFileEditor from '../../../components/ui/MultiFileEditor';

export default function Lab06() {
  const { t } = useApp();

  return (
    <>
      {/* ── Exercise 1: Car Racing Simulation ── */}
      <h3 className="font-bold mt-8">
        {t('Exercise 1 — Car Racing Simulation', 'Exercițiul 1 — Simulare cursă auto')}
      </h3>
      <p>
        {t(
          'Design a polymorphic car racing simulation. Create an abstract Car base class and 5 derived car types: Volvo, BMW, Seat, Fiat, and RangeRover. Each car type has a specific fuel capacity (tank size in liters), fuel consumption (liters per 100 km), and average speed (km/h) that varies depending on the weather conditions.',
          'Proiectați o simulare polimorfă de cursă auto. Creați o clasă abstractă Car de bază și 5 tipuri derivate: Volvo, BMW, Seat, Fiat și RangeRover. Fiecare tip de mașină are o capacitate specifică a rezervorului (litri), un consum de combustibil (litri la 100 km) și o viteză medie (km/h) care variază în funcție de condițiile meteo.'
        )}
      </p>

      <Box type="definition">
        <p className="font-semibold mb-1">{t('Weather conditions:', 'Condiții meteo:')}</p>
        <p className="text-sm">
          {t(
            'The Weather enum has three values: Rain, Sunny, and Snow. Each car type must define its fuel consumption and average speed for each weather condition.',
            'Enum-ul Weather are trei valori: Rain, Sunny și Snow. Fiecare tip de mașină trebuie să definească consumul de combustibil și viteza medie pentru fiecare condiție meteo.'
          )}
        </p>
      </Box>

      <Box type="warning">
        <p className="text-sm">
          {t(
            'Hint: The abstract Car class should declare pure virtual methods for getting fuel capacity, consumption, and speed based on weather. Each derived class overrides these with its own values.',
            'Indiciu: Clasa abstractă Car trebuie să declare metode pur virtuale pentru obținerea capacității rezervorului, consumului și vitezei în funcție de vreme. Fiecare clasă derivată le suprascrie cu valorile proprii.'
          )}
        </p>
      </Box>

      <p>
        {t(
          'The Circuit class manages the race. It provides the following methods:',
          'Clasa Circuit gestionează cursa. Aceasta oferă următoarele metode:'
        )}
      </p>
      <ul className="list-disc ml-6 space-y-1 text-sm">
        <li><code>SetLength(int km)</code> — {t('sets the circuit length in km', 'setează lungimea circuitului în km')}</li>
        <li><code>SetWeather(Weather w)</code> — {t('sets the weather condition for the race', 'setează condiția meteo pentru cursă')}</li>
        <li><code>AddCar(Car* c)</code> — {t('adds a car to the race', 'adaugă o mașină în cursă')}</li>
        <li><code>Race()</code> — {t('simulates the race (computes time, checks fuel)', 'simulează cursa (calculează timpul, verifică combustibilul)')}</li>
        <li><code>ShowFinalRanks()</code> — {t('displays cars sorted by finishing time', 'afișează mașinile sortate după timpul de sosire')}</li>
        <li><code>ShowWhoDidNotFinish()</code> — {t('displays cars that ran out of fuel', 'afișează mașinile care au rămas fără combustibil')}</li>
      </ul>

      <Box type="formula">
        <p className="text-sm">
          {t(
            'A car finishes the race if: fuel_capacity / (consumption / 100) >= circuit_length. The finishing time is: circuit_length / average_speed.',
            'O mașină termină cursa dacă: capacitate_rezervor / (consum / 100) >= lungime_circuit. Timpul de sosire este: lungime_circuit / viteză_medie.'
          )}
        </p>
      </Box>

      <p className="mt-4 font-semibold text-sm">{t('Starter code (main.cpp):', 'Cod inițial (main.cpp):')}</p>
      <Code>{`int main() {
   Circuit c;
   c.SetLength(100);
   c.SetWeather(Weather::Rain);
   c.AddCar(new Volvo());
   c.AddCar(new BMW());
   c.AddCar(new Seat());
   c.AddCar(new Fiat());
   c.AddCar(new RangeRover());
   c.Race();
   c.ShowFinalRanks();
   c.ShowWhoDidNotFinish();
   return 0;
}`}</Code>

      <MultiFileEditor
        files={[
          { name: 'Car.h', content: '', language: 'cpp' },
          { name: 'Circuit.h', content: '', language: 'cpp' },
          { name: 'Circuit.cpp', content: '', language: 'cpp' },
          {
            name: 'main.cpp',
            content: `#include "Circuit.h"
#include <iostream>

int main() {
   Circuit c;
   c.SetLength(100);
   c.SetWeather(Weather::Rain);
   c.AddCar(new Volvo());
   c.AddCar(new BMW());
   c.AddCar(new Seat());
   c.AddCar(new Fiat());
   c.AddCar(new RangeRover());
   c.Race();
   c.ShowFinalRanks();
   c.ShowWhoDidNotFinish();
   return 0;
}`,
            language: 'cpp',
          },
        ]}
      />
    </>
  );
}
