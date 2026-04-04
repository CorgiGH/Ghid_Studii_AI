import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code } from '../../../components/ui';
import MultiFileEditor from '../../../components/ui/MultiFileEditor';

export default function Lab06Extra() {
  const { t } = useApp();

  return (
    <>
      {/* ── Exercise 1: JSON Value Hierarchy ── */}
      <h3 className="font-bold mt-8">
        {t('Exercise 1 — JSON Value Hierarchy', 'Exercițiul 1 — Ierarhie de valori JSON')}
      </h3>
      <p>
        {t(
          'Implement a class hierarchy that models JSON values. The base class JsonValue is abstract and has a virtual destructor and a pure virtual print(ostream&) method.',
          'Implementați o ierarhie de clase care modelează valori JSON. Clasa de bază JsonValue este abstractă și are un destructor virtual și o metodă pur virtuală print(ostream&).'
        )}
      </p>

      <Box type="definition">
        <p className="font-semibold mb-1">{t('Derived classes:', 'Clase derivate:')}</p>
        <ul className="list-disc ml-4 space-y-1 text-sm">
          <li><code>NullValue</code> — {t('prints "null"', 'afișează "null"')}</li>
          <li><code>NumberValue</code> — {t('stores a numeric value (int/double)', 'stochează o valoare numerică (int/double)')}</li>
          <li><code>BoolValue</code> — {t('stores true/false', 'stochează true/false')}</li>
          <li><code>StringValue</code> — {t('stores a string (max 255 characters)', 'stochează un string (max 255 caractere)')}</li>
          <li><code>ArrayValue</code> — {t('stores up to 16 JsonValue pointers; has add() method', 'stochează până la 16 pointeri JsonValue; are metoda add()')}</li>
          <li><code>ObjectValue</code> — {t('stores up to 16 name/value pairs; has add(name, value) method', 'stochează până la 16 perechi nume/valoare; are metoda add(name, value)')}</li>
        </ul>
      </Box>

      <Box type="warning">
        <p className="text-sm">
          {t(
            'Hint: Casting an ObjectValue or ArrayValue to unsigned (via operator unsigned()) should return the total number of direct child nodes.',
            'Indiciu: Conversia unui ObjectValue sau ArrayValue la unsigned (prin operator unsigned()) trebuie să returneze numărul total de noduri copil directe.'
          )}
        </p>
      </Box>

      <p>
        {t(
          'The print() method should produce valid JSON output with proper indentation. Arrays use [ ] brackets, objects use { } braces, strings are quoted, etc.',
          'Metoda print() trebuie să producă output JSON valid cu indentare corespunzătoare. Tablourile folosesc paranteze [ ], obiectele folosesc acolade { }, stringurile sunt între ghilimele, etc.'
        )}
      </p>

      <p className="mt-4 font-semibold text-sm">{t('Starter code (main.cpp):', 'Cod inițial (main.cpp):')}</p>
      <Code>{`int main() {
    auto array_numbers = new ArrayValue();
    array_numbers->add(new NumberValue(5));
    array_numbers->add(new NumberValue(10));
    array_numbers->add(new NumberValue(15));
    auto array_strings = new ArrayValue();
    array_strings->add(new StringValue("abc"));
    array_strings->add(new StringValue("def"));
    array_strings->add(new StringValue("ghi"));
    auto subobject = new ObjectValue();
    subobject->add("email", new StringValue("t@gmail.com"));
    subobject->add("name", new StringValue("T"));
    subobject->add("online", new BoolValue(true));
    auto object = new ObjectValue();
    object->add("n", new NullValue());
    object->add("array_numbers", array_numbers);
    object->add("array_strings", array_strings);
    object->add("info", subobject);
    std::cout << "Top node has " << (unsigned)*object << " subnodes\\n";
    object->print(std::cout);
}`}</Code>

      <MultiFileEditor
        files={[
          { name: 'json.h', content: '', language: 'cpp' },
          { name: 'json.cpp', content: '', language: 'cpp' },
          {
            name: 'main.cpp',
            content: `#include "json.h"
#include <iostream>

int main() {
    auto array_numbers = new ArrayValue();
    array_numbers->add(new NumberValue(5));
    array_numbers->add(new NumberValue(10));
    array_numbers->add(new NumberValue(15));
    auto array_strings = new ArrayValue();
    array_strings->add(new StringValue("abc"));
    array_strings->add(new StringValue("def"));
    array_strings->add(new StringValue("ghi"));
    auto subobject = new ObjectValue();
    subobject->add("email", new StringValue("t@gmail.com"));
    subobject->add("name", new StringValue("T"));
    subobject->add("online", new BoolValue(true));
    auto object = new ObjectValue();
    object->add("n", new NullValue());
    object->add("array_numbers", array_numbers);
    object->add("array_strings", array_strings);
    object->add("info", subobject);
    std::cout << "Top node has " << (unsigned)*object << " subnodes\\n";
    object->print(std::cout);
    return 0;
}`,
            language: 'cpp',
          },
        ]}
      />
    </>
  );
}
