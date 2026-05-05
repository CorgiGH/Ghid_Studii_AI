import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Toggle, Section } from '../../../components/ui';

export default function Lab10() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <p className="mb-4 text-sm opacity-80">
        {t(
          'Source: OOP Lab 10 — C++ Exceptions & Template Array with Iterator. UAIC 2024-2025.',
          'Sursă: Lab POO 10 — Excepții C++ & Tablou Template cu Iterator. UAIC 2024-2025.'
        )}
      </p>

      <Section
        title={t('Part 1: Exception Example', 'Partea 1: Exemplu de Excepții')}
        id="oop-lab_10-exceptions-intro"
        checked={!!checked['oop-lab_10-exceptions-intro']}
        onCheck={() => toggleCheck('oop-lab_10-exceptions-intro')}
      >
        <Box type="definition">
          <p className="font-semibold mb-2">{t('Study the exception example', 'Studiați exemplul de excepții')}</p>
          <p className="text-sm mb-2">
            {t(
              'The following code demonstrates custom exception classes inheriting from std::exception. Study how throw and catch interact with the exception hierarchy.',
              'Codul următor demonstrează clase de excepții personalizate care moștenesc din std::exception. Studiați modul în care throw și catch interacționează cu ierarhia excepțiilor.'
            )}
          </p>
        </Box>

        <Code>{`#include <iostream>
#include <exception>
using namespace std;

class exceptie1 : public exception
{
    virtual const char* what() const throw()
    {
        return "Impartire la 0!";
    }
};

class exceptie2 : public exception
{
    virtual const char* what() const throw()
    {
        return "Indexul este inafara domeniului!";
    }
};

int main()
{
    int z=-1, x = 50, y = 0;
    int arr[4] = { 0 };
    int i = 10;
    exceptie1 divide0;
    exceptie2 index_out_of_bounds;

    try
    {
        if (y==0)
            throw divide0;
        z = x / y;
        cout << "Fara exceptie: z=" << z << endl;
    }
    catch (exception& e)
    {
        cout << "Exceptie: " << e.what() << endl;
    }

    try
    {
        if (i > 3)
            throw index_out_of_bounds;
        arr[i] = z;
        for (i = 0; i < 4; i++)
            cout << "arr[" << i << "] = " << arr[i] << endl;
    }
    catch (exception& e)
    {
        cout << "Exceptie: " << e.what() << endl;
    }

    return 0;
}`}</Code>

        <Toggle
          question={t('What does this print?', 'Ce afișează?')}
          showLabel={t('Show answer', 'Arată răspunsul')}
          hideLabel={t('Hide answer', 'Ascunde răspunsul')}
          answer={
            <div>
              <Code>{`Exceptie: Impartire la 0!
Exceptie: Indexul este inafara domeniului!`}</Code>
              <p className="text-sm mt-2">
                {t(
                  'Both try blocks throw their respective exceptions. The catch clauses handle them polymorphically via exception& — virtual dispatch calls the correct what() method.',
                  'Ambele blocuri try aruncă excepțiile respective. Clauzele catch le gestionează polimorfic prin exception& — dispatch-ul virtual apelează metoda what() corectă.'
                )}
              </p>
            </div>
          }
        />
      </Section>

      <Section
        title={t('Part 2: Template Array with Exceptions & Iterator', 'Partea 2: Tablou Template cu Excepții & Iterator')}
        id="oop-lab_10-template-array"
        checked={!!checked['oop-lab_10-template-array']}
        onCheck={() => toggleCheck('oop-lab_10-template-array')}
      >
        <Box type="definition">
          <p className="font-semibold mb-2">{t('Problem statement', 'Enunțul problemei')}</p>
          <p className="text-sm mb-3">
            {t(
              'Using the exception example above, build a template Array class that manages a dynamic collection of pointers to objects of type T, and add exceptions for invalid operations. Also implement an ArrayIterator.',
              'Folosind exemplul de excepții de mai sus, construiți o clasă template Array care gestionează o colecție dinamică de pointeri la obiecte de tip T, și adăugați excepții pentru operații invalide. Implementați și un ArrayIterator.'
            )}
          </p>
        </Box>

        <Box type="formula">
          <p className="font-semibold mb-2">{t('Required class interfaces', 'Interfețele de clase necesare')}</p>
          <Code>{`class Compare
{
public:
    virtual int CompareElements(void* e1, void* e2) = 0;
};

template<class T>
class ArrayIterator
{
private:
    int Current; // add other data and functions needed for iterator
public:
    ArrayIterator();
    ArrayIterator& operator ++ ();
    ArrayIterator& operator -- ();
    bool operator= (ArrayIterator<T> &);
    bool operator!=(ArrayIterator<T> &);
    T* GetElement();
};

template<class T>
class Array
{
private:
    T** List;       // array of pointers to T objects
    int Capacity;   // allocated size of pointer list
    int Size;       // number of elements in list
public:
    Array();                              // List unallocated, Capacity=0, Size=0
    ~Array();                             // destructor
    Array(int capacity);                  // allocate with 'capacity' slots
    Array(const Array<T>& otherArray);    // copy constructor

    T& operator[] (int index);            // throws if index out of range

    const Array<T>& operator+=(const T& newElem);
    const Array<T>& Insert(int index, const T& newElem);   // throws if invalid index
    const Array<T>& Insert(int index, const Array<T> otherArray);
    const Array<T>& Delete(int index);                     // throws if invalid index

    bool operator=(const Array<T>& otherArray);

    void Sort();
    void Sort(int(*compare)(const T&, const T&));
    void Sort(Compare* comparator);

    int BinarySearch(const T& elem);
    int BinarySearch(const T& elem, int(*compare)(const T&, const T&));
    int BinarySearch(const T& elem, Compare* comparator);

    int Find(const T& elem);
    int Find(const T& elem, int(*compare)(const T&, const T&));
    int Find(const T& elem, Compare* comparator);

    int GetSize();
    int GetCapacity();

    ArrayIterator<T> GetBeginIterator();
    ArrayIterator<T> GetEndIterator();
};`}</Code>
        </Box>

        <Toggle
          question={t('Show implementation hints', 'Arată indicii de implementare')}
          showLabel={t('Show hints', 'Arată indicii')}
          hideLabel={t('Hide hints', 'Ascunde indicii')}
          answer={
            <div className="space-y-3 text-sm">
              <p className="font-semibold">
                {t('Key design decisions:', 'Decizii cheie de design:')}
              </p>
              <ul className="list-disc ml-5 space-y-2">
                <li>
                  {t(
                    'Store T** List — an array of pointers, so T objects can be polymorphic and you avoid copying objects.',
                    'Stocați T** List — un tablou de pointeri, astfel T-urile pot fi polimorfe și evitați copierea obiectelor.'
                  )}
                </li>
                <li>
                  {t(
                    'When List is full on Insert, allocate a new larger array (e.g., Capacity*2), copy pointers, delete old array.',
                    'Când List este plin la Insert, alocați un tablou nou mai mare (ex: Capacity*2), copiați pointerii, ștergeți tabloul vechi.'
                  )}
                </li>
                <li>
                  {t(
                    'operator[] should throw a custom out-of-range exception if index < 0 or index >= Size.',
                    'operator[] trebuie să arunce o excepție personalizată out-of-range dacă index < 0 sau index >= Size.'
                  )}
                </li>
                <li>
                  {t(
                    'ArrayIterator stores a pointer to the Array and a current index. operator++ advances the index.',
                    'ArrayIterator stochează un pointer la Array și un index curent. operator++ avansează indexul.'
                  )}
                </li>
              </ul>
              <p className="font-semibold mt-3">
                {t('Exception skeleton:', 'Scheletul excepției:')}
              </p>
              <Code>{`class OutOfRangeException : public exception {
    int _index;
public:
    OutOfRangeException(int idx) : _index(idx) {}
    const char* what() const throw() override {
        return "Index out of range!";
    }
};`}</Code>
            </div>
          }
        />
      </Section>
    </>
  );
}
