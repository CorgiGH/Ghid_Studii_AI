import React from 'react';
import { useApp } from '../../../contexts/AppContext';
import { Box, Code, Section, Toggle } from '../../../components/ui';

export default function Course04() {
  const { t, checked, toggleCheck } = useApp();

  return (
    <>
      <Box type="definition">
        <p className="font-bold mb-2">{t('Course 4 — Topics:', 'Cursul 4 — Subiecte:')}</p>
        <ol className="list-decimal pl-5 text-sm">
          <li>{t('Destructor', 'Destructor')}</li>
          <li>{t('C++ Operators: arithmetic, relational, logical, bitwise, assignment, others', 'Operatori C++: aritmetici, relaționali, logici, pe biți, de atribuire, alții')}</li>
          <li>{t('Operators for Classes: overloading with member functions and friend functions', 'Operatori pentru clase: supraîncărcarea cu funcții membru și funcții friend')}</li>
          <li>{t('Arithmetic & Special Operators: new/delete, cast, index, function call, arrow, comma', 'Operatori aritmetici și speciali: new/delete, cast, index, apel funcție, săgeată, virgulă')}</li>
          <li>{t('Comparison & Logical Operators: relational, logical, lazy evaluation loss', 'Operatori de comparație și logici: relaționali, logici, pierderea evaluării leneșe')}</li>
          <li>{t('Assignment & Object Operations: operator=, copy vs move, returning objects from functions', 'Atribuire și operații cu obiecte: operator=, copiere vs mutare, returnarea obiectelor din funcții')}</li>
        </ol>
      </Box>

      {/* ── 1. Destructor ── */}
      <Section title={t('1. Destructor', '1. Destructor')} id="oop-course_4-destructor" checked={!!checked['oop-course_4-destructor']} onCheck={() => toggleCheck('oop-course_4-destructor')}>
        <Box type="definition">
          <p className="font-bold">{t('Destructor', 'Destructor')}</p>
          <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
            <li>{t('A destructor function is called whenever we want to free the memory that an object occupies.', 'Funcția destructor este apelată ori de câte ori dorim să eliberăm memoria ocupată de un obiect.')}</li>
            <li>{t('A destructor (if exists) is only one and has no parameters.', 'Un destructor (dacă există) este unic și nu are parametri.')}</li>
            <li>{t('A destructor cannot be static.', 'Un destructor nu poate fi static.')}</li>
            <li>{t('A destructor can have different access modifiers (public/private/protected).', 'Un destructor poate avea diferiți modificatori de acces (public/private/protected).')}</li>
          </ul>
        </Box>

        <Code>{`class Date {
private:
    int x;
public:
    Date();
    ~Date();
};
Date::Date() : x(100) { ... }
Date::~Date() { ... }

void main() {
    Date d;
}`}</Code>

        <Box type="theorem">
          <p className="font-bold">{t('Common Usage', 'Utilizare comună')}</p>
          <p className="text-sm">{t('The most common usage of the destructor is to deallocate the memory that has been allocated within the constructor or other functions.', 'Cea mai comună utilizare a destructorului este de a dealoca memoria alocată în constructor sau în alte funcții.')}</p>
        </Box>

        <Code>{`class String {
    char * text;
public:
    String(const char * s) {
        text = new char[strlen(s) + 1];
        memcpy(text, s, strlen(s) + 1);
    }
    ~String() {
        delete text;
        text = nullptr;
    }
};

void main() {
    String * s = new String("C++");
    // some operations
    delete s;
}`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Private Destructor', 'Destructor privat')}</p>
          <p className="text-sm">{t('If the destructor is private, the compiler will not allow creating stack-allocated objects (because the destructor would be called automatically at scope exit). However, heap-allocated objects (new) will compile if never deleted. A static method can call a private destructor from within the class.', 'Dacă destructorul este privat, compilatorul nu va permite crearea obiectelor alocate pe stack (deoarece destructorul ar fi apelat automat la ieșirea din scop). Totuși, obiectele alocate pe heap (new) vor compila dacă nu sunt șterse niciodată. O metodă statică poate apela un destructor privat din interiorul clasei.')}</p>
        </Box>

        <Code>{`class Date {
private:
    int x;
public:
    Date();
    static void DestroyData(Date *d);
private:
    ~Date();
};

Date::Date() : x(100) { ... }
Date::~Date() { ... }

void Date::DestroyData(Date *d) {
    delete d; // OK: private destructor accessible from within the class
}

void main() {
    Date *d = new Date();
    Date::DestroyData(d);
}`}</Code>

        <p className="font-bold mt-4">{t('When is the destructor called?', 'Când este apelat destructorul?')}</p>
        <ol className="list-decimal pl-5 text-sm space-y-1">
          <li>{t('When the program ends, for every global variable.', 'Când programul se termină, pentru fiecare variabilă globală.')}</li>
          <li>{t('When a function/method ends, for every local variable.', 'Când o funcție/metodă se termină, pentru fiecare variabilă locală.')}</li>
          <li>{t('When execution exits a scope (for variables defined within that scope).', 'Când execuția iese dintr-un scop (pentru variabilele definite în acel scop).')}</li>
          <li>{t('When the delete operator is called on a heap-allocated instance.', 'Când operatorul delete este apelat asupra unei instanțe alocate pe heap.')}</li>
        </ol>

        <Box type="theorem">
          <p className="font-bold">{t('Destruction Order', 'Ordinea distrugerii')}</p>
          <p className="text-sm">{t('Objects are destroyed in the reverse order of their creation (like a stack — first created is the last destroyed). For a class with member objects, the class destructor runs first, then member destructors in reverse declaration order.', 'Obiectele sunt distruse în ordinea inversă a creării lor (ca un stack — primul creat este ultimul distrus). Pentru o clasă cu obiecte membre, destructorul clasei se execută primul, apoi destructorii membrilor în ordinea inversă a declarării.')}</p>
        </Box>

        <Code>{`class Tree   { public: ~Tree()   { printf("dtor: Tree\\n");   } };
class Car    { public: ~Car()    { printf("dtor: Car\\n");    } };
class Animal { public: ~Animal() { printf("dtor: Animal\\n"); } };

class Date {
    Tree t;
    Car c;
    Animal a;
public:
    ~Date() { printf("dtor: Date\\n"); }
};

void main() { Date d; }
// Output: dtor: Date, dtor: Animal, dtor: Car, dtor: Tree`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Default Destructor Generation', 'Generarea destructorului implicit')}</p>
          <p className="text-sm">{t('If the destructor is missing but the class has data members with their own destructors, the compiler creates a default destructor automatically.', 'Dacă destructorul lipsește dar clasa are membri date cu proprii destructori, compilatorul creează automat un destructor implicit.')}</p>
        </Box>

        <Box type="warning">
          <p className="font-bold">delete vs delete[]</p>
          <p className="text-sm">{t('When an array of instances is created on the heap, always use delete[] to destroy it, not delete. Using delete on an array only destroys the first element and may crash. delete[] calls the destructor for every element in reverse order.', 'Când un vector de instanțe este creat pe heap, folosiți întotdeauna delete[] pentru a-l distruge, nu delete. Folosirea delete pe un vector distruge doar primul element și poate cauza crash. delete[] apelează destructorul pentru fiecare element în ordine inversă.')}</p>
        </Box>

        <Code>{`int global_id = 0;
class Date {
    int id;
public:
    Date()  { global_id++; id = global_id; printf("ctor id:%d\\n", id); }
    ~Date() { printf("dtor id:%d\\n", id); }
};

void main() {
    Date *d = new Date[5];
    delete [] d;
}
// Output: ctor id:1..5, then dtor id:5, 4, 3, 2, 1`}</Code>

        <Toggle
          question={t('What happens if you use delete instead of delete[] on an array of objects?', 'Ce se întâmplă dacă folosești delete în loc de delete[] pe un vector de obiecte?')}
          answer={t('Only the first object in the array has its destructor called, and the program will likely crash (especially in debug mode). The destruction is also not in the correct reverse order. Always use delete[] for arrays allocated with new[].', 'Doar primul obiect din vector are destructorul apelat, iar programul probabil se va bloca (mai ales în modul debug). Distrugerea nu este nici în ordinea inversă corectă. Folosiți întotdeauna delete[] pentru vectori alocați cu new[].')}
        />
      </Section>

      {/* ── 2. C++ Operators ── */}
      <Section title={t('2. C++ Operators', '2. Operatori C++')} id="oop-course_4-cpp-operators" checked={!!checked['oop-course_4-cpp-operators']} onCheck={() => toggleCheck('oop-course_4-cpp-operators')}>
        <Box type="definition">
          <p className="font-bold">{t('Operator Classification', 'Clasificarea operatorilor')}</p>
          <p className="text-sm mt-1">{t('By number of parameters:', 'După numărul de parametri:')}</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>{t('Unary (one operand)', 'Unari (un operand)')}</li>
            <li>{t('Binary (two operands)', 'Binari (doi operanzi)')}</li>
            <li>{t('Ternary (three operands: ?:)', 'Ternari (trei operanzi: ?:)')}</li>
            <li>{t('Multi parameter (function call)', 'Multi parametru (apel funcție)')}</li>
          </ul>
          <p className="text-sm mt-2">{t('By operation type:', 'După tipul operației:')}</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>{t('Arithmetic, Relational, Logical, Bitwise, Assignment, Others', 'Aritmetici, Relaționali, Logici, Pe biți, De atribuire, Alții')}</li>
          </ul>
          <p className="text-sm mt-2">{t('By overloading possibility:', 'După posibilitatea de supraîncărcare:')}</p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li>{t('Those that CAN be overloaded vs those that CANNOT', 'Cei care POT fi supraîncărcați vs cei care NU POT')}</li>
          </ul>
        </Box>

        <p className="font-bold mt-3">{t('Arithmetic Operators', 'Operatori aritmetici')}</p>
        <div className="overflow-x-auto mt-2">
          <table className="text-sm border-collapse w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                <th className="text-left p-2">{t('Operator', 'Operator')}</th>
                <th className="text-left p-2">{t('Type', 'Tip')}</th>
                <th className="text-left p-2">{t('Overload', 'Supraîncărcare')}</th>
                <th className="text-left p-2">{t('Format', 'Format')}</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['+', t('Binary', 'Binar'), t('Yes', 'Da'), 'A+B'],
                ['-', t('Binary', 'Binar'), t('Yes', 'Da'), 'A-B'],
                ['*', t('Binary', 'Binar'), t('Yes', 'Da'), 'A*B'],
                ['/', t('Binary', 'Binar'), t('Yes', 'Da'), 'A/B'],
                ['%', t('Binary', 'Binar'), t('Yes', 'Da'), 'A%B'],
                ['++ (post/prefix)', t('Unary', 'Unar'), t('Yes', 'Da'), 'A++ / ++A'],
                ['-- (post/prefix)', t('Unary', 'Unar'), t('Yes', 'Da'), 'A-- / --A'],
              ].map(([op, type, overload, fmt], i) => (
                <tr key={i} className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                  <td className="p-2 font-mono">{op}</td>
                  <td className="p-2">{type}</td>
                  <td className="p-2">{overload}</td>
                  <td className="p-2 font-mono">{fmt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="font-bold mt-4">{t('Relational Operators', 'Operatori relaționali')}</p>
        <div className="overflow-x-auto mt-2">
          <table className="text-sm border-collapse w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                <th className="text-left p-2">{t('Operator', 'Operator')}</th>
                <th className="text-left p-2">{t('Type', 'Tip')}</th>
                <th className="text-left p-2">{t('Format', 'Format')}</th>
              </tr>
            </thead>
            <tbody>
              {['==', '>', '<', '<=', '>=', '!='].map((op, i) => (
                <tr key={i} className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                  <td className="p-2 font-mono">{op}</td>
                  <td className="p-2">{t('Binary', 'Binar')}</td>
                  <td className="p-2 font-mono">A {op} B</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="font-bold mt-4">{t('Logical & Bitwise Operators', 'Operatori logici și pe biți')}</p>
        <div className="overflow-x-auto mt-2">
          <table className="text-sm border-collapse w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                <th className="text-left p-2">{t('Operator', 'Operator')}</th>
                <th className="text-left p-2">{t('Type', 'Tip')}</th>
                <th className="text-left p-2">{t('Format', 'Format')}</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['&&', t('Binary', 'Binar'), 'A && B'],
                ['||', t('Binary', 'Binar'), 'A || B'],
                ['!', t('Unary', 'Unar'), '!A'],
                ['&', t('Binary', 'Binar'), 'A & B'],
                ['|', t('Binary', 'Binar'), 'A | B'],
                ['^', t('Binary', 'Binar'), 'A ^ B'],
                ['<<', t('Binary', 'Binar'), 'A << B'],
                ['>>', t('Binary', 'Binar'), 'A >> B'],
                ['~', t('Unary', 'Unar'), '~A'],
              ].map(([op, type, fmt], i) => (
                <tr key={i} className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                  <td className="p-2 font-mono">{op}</td>
                  <td className="p-2">{type}</td>
                  <td className="p-2 font-mono">{fmt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="font-bold mt-4">{t('Assignment Operators', 'Operatori de atribuire')}</p>
        <p className="text-sm">{t('All assignment operators are binary and overloadable:', 'Toți operatorii de atribuire sunt binari și supraîncărcabili:')}</p>
        <p className="text-sm font-mono mt-1">= += -= *= /= %= &gt;&gt;= &lt;&lt;= &amp;= ^= |=</p>

        <p className="font-bold mt-4">{t('Other Operators', 'Alți operatori')}</p>
        <div className="overflow-x-auto mt-2">
          <table className="text-sm border-collapse w-full">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                <th className="text-left p-2">{t('Operator', 'Operator')}</th>
                <th className="text-left p-2">{t('Overload', 'Supraîncărcare')}</th>
                <th className="text-left p-2">{t('Notes', 'Note')}</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['sizeof', t('No', 'Nu'), t('Unary, returns value', 'Unar, returnează valoare')],
                ['new / delete', t('Yes', 'Da'), t('Unary, new returns pointer', 'Unar, new returnează pointer')],
                ['?: (ternary)', t('No', 'Nu'), t('C ? A : B', 'C ? A : B')],
                [':: (scope)', t('No', 'Nu'), 'A::B'],
                ['(type) cast', t('Yes', 'Da'), '(A)B or A(B)'],
                ['-> (pointer)', t('Yes', 'Da'), 'A->B'],
                ['. (member)', t('No', 'Nu'), 'A.B'],
                ['[] (index)', t('Yes', 'Da'), 'A[B]'],
                ['() (function)', t('Yes', 'Da'), 'A(B,C,...)'],
                [', (list)', t('Yes', 'Da'), '(A,B)'],
              ].map(([op, overload, notes], i) => (
                <tr key={i} className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                  <td className="p-2 font-mono">{op}</td>
                  <td className="p-2">{overload}</td>
                  <td className="p-2">{notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Box type="formula">
          <p className="font-bold">{t('Evaluation Order (Precedence)', 'Ordinea de evaluare (Precedență)')}</p>
          <ol className="list-decimal pl-5 text-sm space-y-0 mt-1 font-mono">
            <li>::</li>
            <li>() [] -&gt; . ++ --</li>
            <li>+ - ! ~ ++ -- (type)* &amp; sizeof</li>
            <li>* / %</li>
            <li>+ -</li>
            <li>&lt;&lt; &gt;&gt;</li>
            <li>&lt; &lt;= &gt; &gt;=</li>
            <li>== !=</li>
            <li>&amp;</li>
            <li>^</li>
            <li>|</li>
            <li>&amp;&amp;</li>
            <li>||</li>
            <li>?:</li>
            <li>= += -= *= /= %= &gt;&gt;= &lt;&lt;= &amp;= ^= |=</li>
            <li>,</li>
          </ol>
        </Box>

        <Toggle
          question={t('Can all C++ operators be overloaded?', 'Pot fi supraîncărcați toți operatorii C++?')}
          answer={t('No. Operators like sizeof, :: (scope), . (member access), and ?: (ternary) cannot be overloaded. Most other operators (arithmetic, relational, logical, bitwise, assignment, new, delete, cast, [], (), ->, comma) can be overloaded.', 'Nu. Operatori precum sizeof, :: (scop), . (acces membru) și ?: (ternar) nu pot fi supraîncărcați. Majoritatea celorlalți operatori (aritmetici, relaționali, logici, pe biți, de atribuire, new, delete, cast, [], (), ->, virgulă) pot fi supraîncărcați.')}
        />
      </Section>

      {/* ── 3. Operators for Classes ── */}
      <Section title={t('3. Operators for Classes', '3. Operatori pentru clase')} id="oop-course_4-class-operators" checked={!!checked['oop-course_4-class-operators']} onCheck={() => toggleCheck('oop-course_4-class-operators')}>
        <Box type="definition">
          <p className="font-bold">{t('Operator Overloading for Classes', 'Supraîncărcarea operatorilor pentru clase')}</p>
          <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
            <li>{t('A class can define special functions using the keyword "operator" that tell the compiler how to handle operations between objects.', 'O clasă poate defini funcții speciale folosind cuvântul cheie "operator" care indică compilatorului cum să gestioneze operațiile între obiecte.')}</li>
            <li>{t('These functions can have access modifiers (public/private/protected) and follow the same rules.', 'Aceste funcții pot avea modificatori de acces (public/private/protected) și urmează aceleași reguli.')}</li>
            <li>{t('Operators can also be implemented outside the class — using "friend" functions to access private members.', 'Operatorii pot fi implementați și în afara clasei — folosind funcții "friend" pentru a accesa membrii privați.')}</li>
          </ul>
        </Box>

        <p className="font-bold mt-3">{t('Basic operator+ as a member function:', 'operator+ de bază ca funcție membru:')}</p>
        <Code>{`class Integer {
    int value;
public:
    Integer(int val) : value(val) {}
    int operator+ (const Integer &i);
};

int Integer::operator+(const Integer &i) {
    return value + i.value;
}

void main() {
    Integer n1(100);
    Integer n2(200);
    int x = n1 + n2; // equivalent to n1.operator+(n2)
}`}</Code>

        <Box type="theorem">
          <p className="text-sm">{t('The addition operation is applied for the left parameter (the object), the right parameter being the argument. In other words: "n1+n2" is equivalent to "n1.operator+(n2)".', 'Operația de adunare se aplică pentru parametrul din stânga (obiectul), parametrul din dreapta fiind argumentul. Cu alte cuvinte: "n1+n2" este echivalent cu "n1.operator+(n2)".')}</p>
        </Box>

        <p className="font-bold mt-4">{t('Operator overloading (multiple signatures):', 'Supraîncărcarea operatorului (semnături multiple):')}</p>
        <Code>{`class Integer {
    int value;
public:
    Integer(int val) : value(val) {}
    int operator+ (const Integer &i) { return value + i.value; }
    int operator+ (float nr);
};

int Integer::operator+(float nr) {
    return value + (int)nr;
}

void main() {
    Integer n1(100);
    Integer n2(200);
    int x = n1 + n2;   // calls operator+(const Integer&)
    int y = n1 + 1.2f;  // calls operator+(float)
}`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Order matters!', 'Ordinea contează!')}</p>
          <p className="text-sm">{t('If Integer has operator+(float), it handles "Integer + float" but NOT "float + Integer". A member function always has the object on the left side. To support both orders, use friend functions.', 'Dacă Integer are operator+(float), gestionează "Integer + float" dar NU "float + Integer". O funcție membru are întotdeauna obiectul în partea stângă. Pentru a suporta ambele ordini, folosiți funcții friend.')}</p>
        </Box>

        <p className="font-bold mt-4">{t('Friend functions for symmetric operations:', 'Funcții friend pentru operații simetrice:')}</p>
        <Code>{`class Integer {
    int value;
public:
    Integer(int val) : value(val) {}
    friend int operator+ (const Integer &i, float val);
    friend int operator+ (float val, const Integer &i);
};

int operator+(const Integer &i, float val) {
    return i.value + (int)val;
}
int operator+(float val, const Integer &i) {
    return i.value + (int)val;
}

void main() {
    Integer n1(100);
    Integer n2(200);
    int y = (1.2f + n1) + (n2 + 1.5f); // both orders work!
}`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Ambiguity Error', 'Eroare de ambiguitate')}</p>
          <p className="text-sm">{t('If both a member operator+(Integer) and a friend operator+(Integer, Integer) are defined for the same operation, the compiler reports an ambiguity error: "operator + is ambiguous".', 'Dacă atât un membru operator+(Integer) cât și un friend operator+(Integer, Integer) sunt definiți pentru aceeași operație, compilatorul raportează o eroare de ambiguitate: "operator + is ambiguous".')}</p>
        </Box>

        <p className="font-bold mt-4">{t('Unary operator overloading:', 'Supraîncărcarea operatorului unar:')}</p>
        <Code>{`class Integer {
    int value;
public:
    Integer(int val) : value(val) {}
    int operator! ();
};

int Integer::operator!() {
    return 100 - this->value;
}

void main() {
    Integer n1(20);
    int x = !n1; // x = 80
}`}</Code>

        <Box type="formula">
          <p className="font-bold">{t('Recommendation', 'Recomandare')}</p>
          <p className="text-sm">{t('For operators like +, -, *, /, %, >, <, >=, <=, !=, ==, &, |, &&, ||, ^, !, ~, it is recommended to use friend functions and to provide parameter combinations (class+int, int+class, class+double, etc).', 'Pentru operatorii precum +, -, *, /, %, >, <, >=, <=, !=, ==, &, |, &&, ||, ^, !, ~, se recomandă folosirea funcțiilor friend și furnizarea combinațiilor de parametri (clasă+int, int+clasă, clasă+double, etc).')}</p>
        </Box>

        <Toggle
          question={t('Why is "1.2f + n1" a compilation error when operator+ is a member function of Integer?', 'De ce este "1.2f + n1" o eroare de compilare când operator+ este funcție membru a lui Integer?')}
          answer={t('Because a member operator+ means "object.operator+(argument)". The left operand must be the object. With "1.2f + n1", the left operand is a float, which has no operator+ that accepts an Integer. The solution is to use a friend function: "friend int operator+(float, const Integer&)".', 'Deoarece un operator+ membru înseamnă "obiect.operator+(argument)". Operandul stâng trebuie să fie obiectul. Cu "1.2f + n1", operandul stâng este un float, care nu are operator+ ce acceptă un Integer. Soluția este folosirea unei funcții friend: "friend int operator+(float, const Integer&)".')}
        />
      </Section>

      {/* ── 4. Arithmetic & Special Operators ── */}
      <Section title={t('4. Arithmetic & Special Operators', '4. Operatori aritmetici și speciali')} id="oop-course_4-arithmetic" checked={!!checked['oop-course_4-arithmetic']} onCheck={() => toggleCheck('oop-course_4-arithmetic')}>
        <p className="font-bold">{t('Prefix vs Postfix Operators (++ and --)', 'Operatori prefix vs postfix (++ și --)')}</p>
        <p className="text-sm">{t('The prefix form has no parameter, the postfix form has a dummy int parameter (always 0).', 'Forma prefix nu are parametru, forma postfix are un parametru int fictiv (întotdeauna 0).')}</p>

        <Code>{`class Integer {
    int value;
public:
    Integer(int val) : value(val) {}
    Integer& operator++ ();          // prefix: ++n1
    Integer  operator++ (int);       // postfix: n1++
};

// Prefix: increment first, then return reference
Integer& Integer::operator++() {
    value += 1;
    return (*this);
}

// Postfix: save old value, increment, return old copy
Integer Integer::operator++(int) {
    Integer tempObject(value);
    value += 1;
    return tempObject;
}`}</Code>

        <Box type="theorem">
          <p className="font-bold">{t('Prefix vs Postfix Semantics', 'Semantica prefix vs postfix')}</p>
          <p className="text-sm">{t('Postfix: the value is returned first, then the operation is executed. Prefix: the operation is executed first, then the value is returned. Prefix/postfix operators can also be friend functions (first parameter should be a reference).', 'Postfix: valoarea este returnată prima, apoi operația se execută. Prefix: operația se execută prima, apoi valoarea este returnată. Operatorii prefix/postfix pot fi și funcții friend (primul parametru trebuie să fie o referință).')}</p>
        </Box>

        <p className="font-bold mt-4">{t('The new Operator', 'Operatorul new')}</p>
        <Box type="definition">
          <p className="text-sm">{t('The new operator must return void* and has a size_t first parameter. It cannot be used as a friend function. It does NOT call the constructor — it only allocates memory. The constructor is called automatically by the compiler after memory allocation.', 'Operatorul new trebuie să returneze void* și are un prim parametru size_t. Nu poate fi folosit ca funcție friend. NU apelează constructorul — doar alocă memorie. Constructorul este apelat automat de compilator după alocarea memoriei.')}</p>
        </Box>

        <Code>{`int GlobalValue = 0;
class Integer {
    int value;
public:
    Integer(int val) : value(val) {}
    void* operator new(size_t t);
};

void* Integer::operator new(size_t t) {
    return &GlobalValue;
}

void main() {
    Integer *n1 = new Integer(100); // GlobalValue = 100
}`}</Code>

        <p className="text-sm mt-2">{t('Placement new (multiple parameters):', 'Placement new (parametri multipli):')}</p>
        <Code>{`void* Integer::operator new(size_t t, int value) {
    return &GlobalValue;
}

void main() {
    Integer *n1 = new(100) Integer(123);
}`}</Code>

        <p className="font-bold mt-4">{t('The Cast Operator', 'Operatorul de cast')}</p>
        <Box type="definition">
          <p className="text-sm">{t('The cast operator allows transforming an object to another type. No return type is specified (it is the type being cast to). Cast operators cannot use the friend specifier. They are also used for implicit conversions.', 'Operatorul de cast permite transformarea unui obiect în alt tip. Nu se specifică tipul de returnare (este tipul către care se face cast-ul). Operatorii de cast nu pot folosi specificatorul friend. Sunt folosiți și pentru conversii implicite.')}</p>
        </Box>

        <Code>{`class Integer {
    int value;
public:
    Integer(int val) : value(val) {}
    operator float();
};

Integer::operator float() {
    return float(value * 2);
}

void main() {
    Integer n1(2);
    float f = (float)n1;   // f = 4.0 (explicit cast)
    float g = n1;           // g = 4.0 (implicit cast)
    float h = n1 + 0.2f;   // h = 4.2 (cast to float, then + 0.2)
}`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Cast vs operator+', 'Cast vs operator+')}</p>
          <p className="text-sm">{t('If both operator float() and operator+(float) exist, the operator+ takes priority. With only cast: n1 + 0.2f = 4.2 (cast then add). With both: n1 + 0.2f = 20.2 (operator+ called directly as value*10 + f).', 'Dacă există atât operator float() cât și operator+(float), operator+ are prioritate. Doar cu cast: n1 + 0.2f = 4.2 (cast apoi adunare). Cu ambele: n1 + 0.2f = 20.2 (operator+ apelat direct ca value*10 + f).')}</p>
        </Box>

        <p className="font-bold mt-4">{t('The Index Operator []', 'Operatorul de indexare []')}</p>
        <p className="text-sm">{t('Has only one parameter (but it can be of any type). Cannot be a friend function. Return type can be anything.', 'Are un singur parametru (dar poate fi de orice tip). Nu poate fi funcție friend. Tipul de returnare poate fi orice.')}</p>

        <Code>{`class Integer {
    int value;
public:
    Integer(int val) : value(val) {}
    bool operator[](int index);
    bool operator[](const char *name);
};

bool Integer::operator[](int index) {
    return (value & (1 << index)) != 0;
}

bool Integer::operator[](const char *name) {
    if ((strcmp(name, "first") == 0) && ((value & 1) != 0))
        return true;
    if ((strcmp(name, "second") == 0) && ((value & 2) != 0))
        return true;
    return false;
}

void main() {
    Integer n1(2);
    bool ret = n1[1];         // true (bit 1 is set)
    bool v2  = n1["second"];  // true
}`}</Code>

        <p className="font-bold mt-4">{t('The Function Call Operator ()', 'Operatorul de apel funcție ()')}</p>
        <p className="text-sm">{t('Similar to [], but can have multiple parameters or none. Also can only be a member function.', 'Similar cu [], dar poate avea parametri multipli sau niciunul. De asemenea, poate fi doar funcție membru.')}</p>

        <Code>{`class Integer {
    int value;
public:
    Integer(int val) : value(val) {}
    int operator()(int start, int end);
    int operator()();
};

int Integer::operator()(int start, int end) {
    return (value >> start) & ((1 << (end - start)) - 1);
}

int Integer::operator()() {
    return value * 2;
}

void main() {
    Integer n1(122);
    int res = n1(1, 3);  // extracts bits 1..2
    int dbl = n1();       // returns 244
}`}</Code>

        <p className="font-bold mt-4">{t('The Arrow Operator ->', 'Operatorul săgeată ->')}</p>
        <p className="text-sm">{t('Must return a pointer to an object. Must be used with an object, not a pointer. Cannot be a friend function.', 'Trebuie să returneze un pointer la un obiect. Trebuie folosit cu un obiect, nu un pointer. Nu poate fi funcție friend.')}</p>

        <Code>{`class MyData {
    float value;
public:
    void SetValue(float val) { value = val; }
};

class Integer {
    MyData data;
public:
    MyData* operator->();
};

MyData* Integer::operator->() {
    return &data;
}

void main() {
    Integer n1;
    n1->SetValue(100);       // OK: n1 is an object
    // Integer *n2 = &n1;
    // n2->SetValue(100);    // ERROR: n2 is a pointer, not an object
    // (*n2)->SetValue(100);  // OK: dereference pointer first
}`}</Code>

        <Toggle
          question={t('What is the difference between operator[] and operator() for classes?', 'Care este diferența între operator[] și operator() pentru clase?')}
          answer={t('Both must be member functions (no friend). The key difference is that operator[] can only have one parameter, while operator() can have multiple parameters or none at all. Both can have any parameter type and any return type.', 'Ambii trebuie să fie funcții membru (fără friend). Diferența cheie este că operator[] poate avea doar un singur parametru, în timp ce operator() poate avea parametri multipli sau deloc. Ambii pot avea orice tip de parametru și orice tip de returnare.')}
        />
      </Section>

      {/* ── 5. Comparison & Logical Operators ── */}
      <Section title={t('5. Comparison & Logical Operators', '5. Operatori de comparație și logici')} id="oop-course_4-comparison" checked={!!checked['oop-course_4-comparison']} onCheck={() => toggleCheck('oop-course_4-comparison')}>
        <Box type="definition">
          <p className="font-bold">{t('Relational Operators', 'Operatori relaționali')}</p>
          <p className="text-sm">{t('Relational operators are defined exactly like arithmetic ones. From the compiler\'s point of view, there is no real difference between them.', 'Operatorii relaționali sunt definiți exact ca cei aritmetici. Din punctul de vedere al compilatorului, nu există o diferență reală între ei.')}</p>
        </Box>

        <Code>{`class Integer {
    int value;
public:
    Integer(int val) : value(val) {}
    bool operator> (const Integer &i);
};

bool Integer::operator>(const Integer &i) {
    if (value > i.value)
        return true;
    return false;
}

void main() {
    Integer n1(100);
    Integer n2(200);
    if (n2 > n1)
        printf("n2 is greater than n1");
}`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('No type restriction on return value', 'Fără restricție de tip pe valoarea returnată')}</p>
          <p className="text-sm">{t('Relational operators do not need to return a bool even though this is expected. The compiler does not differentiate between arithmetic or relational operators. For example, operator> can return an Integer object!', 'Operatorii relaționali nu trebuie să returneze un bool chiar dacă acest lucru este așteptat. Compilatorul nu diferențiază între operatorii aritmetici sau relaționali. De exemplu, operator> poate returna un obiect Integer!')}</p>
        </Box>

        <Code>{`// operator> returning an object instead of bool
Integer Integer::operator>(const Integer &i) {
    Integer res(this->value + i.value);
    return res;
}

void main() {
    Integer n1(100);
    Integer n2(200);
    (n1 > n2).PrintValue(); // prints "Value is 300"
}`}</Code>

        <p className="font-bold mt-4">{t('Logical Operators', 'Operatori logici')}</p>
        <p className="text-sm">{t('The same logic applies for logical operators (&&, ||). The compiler treats them identically to arithmetic operators.', 'Aceeași logică se aplică pentru operatorii logici (&&, ||). Compilatorul îi tratează identic cu operatorii aritmetici.')}</p>

        <Code>{`class Integer {
    int value;
public:
    Integer(int val) : value(val) {}
    Integer operator&& (const Integer &i);
    void PrintValue();
};

Integer Integer::operator&&(const Integer &i) {
    Integer res(this->value + i.value);
    return res;
}

void main() {
    Integer n1(100);
    Integer n2(200);
    (n1 && n2).PrintValue(); // prints "Value is 300"
}`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Loss of Lazy Evaluation', 'Pierderea evaluării leneșe')}</p>
          <p className="text-sm">{t('When overloading operators like || or &&, the compiler\'s lazy evaluation optimization is lost. Normally, with bool: "true || X" skips evaluating X. But with an overloaded operator||, ALL operands are always evaluated because it becomes a regular function call.', 'La supraîncărcarea operatorilor precum || sau &&, optimizarea de evaluare leneșă a compilatorului se pierde. Normal, cu bool: "true || X" omite evaluarea lui X. Dar cu un operator|| supraîncărcat, TOȚI operanzii sunt întotdeauna evaluați deoarece devine un apel de funcție obișnuit.')}</p>
        </Box>

        <Code>{`class Bool {
    bool value;
    const char *name;
public:
    Bool(bool val, const char *nm) : value(val), name(nm) {}
    Bool operator||(const Bool &i) {
        bool res = value || i.value;
        printf("Compute bool(%s || %s)=>%s\\n",
               name, i.name, res ? "true" : "false");
        Bool b(res, "temp");
        return b;
    }
    operator bool() {
        printf("Return bool for %s => %s\\n",
               this->name, value ? "true" : "false");
        return value;
    }
};

int main() {
    Bool n1(true, "n1");
    Bool n2(false, "n2");
    Bool n3(false, "n3");

    // With built-in ||: only n1 is evaluated (lazy)
    bool res1 = ((bool)n1) || ((bool)n2) || ((bool)n3);
    // Output: "Return bool for n1 => true" (n2,n3 skipped)

    // With overloaded ||: ALL are evaluated
    bool res2 = n1 || n2 || n3;
    // Output: Compute bool(n1 || n2)=>true
    //         Compute bool(temp || n3)=>true
    //         Return bool for temp => true
}`}</Code>

        <p className="font-bold mt-4">{t('The Comma Operator', 'Operatorul virgulă')}</p>
        <p className="text-sm">{t('The list operator (operator,) is used for comma-separated expressions. Without overloading, it evaluates left to right and returns the last value. For example: int x = (10,20,30,40) gives x = 40.', 'Operatorul de listă (operator,) este folosit pentru expresii separate prin virgulă. Fără supraîncărcare, evaluează de la stânga la dreapta și returnează ultima valoare. De exemplu: int x = (10,20,30,40) dă x = 40.')}</p>

        <Code>{`class Integer {
    int value;
public:
    Integer(int val) : value(val) {}
    int operator,(float f);
};

int Integer::operator,(float f) {
    return (int)(value * f);
}

void main() {
    Integer n1(30);
    int res = (n1, 2.5f);      // res = 75 (30 * 2.5)
    int r2  = (n1, 2.5f, 10);  // (n1,2.5f)=75, then (75,10)=10
}`}</Code>

        <Toggle
          question={t('Why does overloading operator|| lose lazy evaluation?', 'De ce supraîncărcarea operator|| pierde evaluarea leneșă?')}
          answer={t('Because an overloaded operator becomes a regular function call. In C++, all function arguments must be evaluated before the function is called. The compiler cannot short-circuit because it does not know the semantics of the custom operator. With built-in ||, the compiler knows that "true || X" is always true and can skip X.', 'Deoarece un operator supraîncărcat devine un apel de funcție obișnuit. În C++, toate argumentele funcției trebuie evaluate înainte ca funcția să fie apelată. Compilatorul nu poate face scurtcircuit deoarece nu cunoaște semantica operatorului personalizat. Cu || built-in, compilatorul știe că "true || X" este întotdeauna true și poate omite X.')}
        />
      </Section>

      {/* ── 6. Assignment & Object Operations ── */}
      <Section title={t('6. Assignment & Object Operations', '6. Atribuire și operații cu obiecte')} id="oop-course_4-assignment" checked={!!checked['oop-course_4-assignment']} onCheck={() => toggleCheck('oop-course_4-assignment')}>
        <Box type="definition">
          <p className="font-bold">{t('Assignment Operator', 'Operatorul de atribuire')}</p>
          <p className="text-sm">{t('It is recommended to return a reference to the object to allow chaining. There is also a move assignment operator that uses a temporary reference (&&).', 'Se recomandă returnarea unei referințe la obiect pentru a permite înlănțuirea. Există și un operator de atribuire prin mutare care folosește o referință temporară (&&).')}</p>
        </Box>

        <Code>{`class Integer {
    int value;
public:
    Integer(int val) : value(val) {}
    Integer& operator= (int val);
};

Integer& Integer::operator=(int val) {
    value = val;
    return (*this);
}

void main() {
    Integer n1(20);
    n1 = 20;
}`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Restrictions on operator=', 'Restricții pentru operator=')}</p>
          <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
            <li>{t('operator=, operator[], operator(), operator-> CANNOT be friend functions (must be non-static members).', 'operator=, operator[], operator(), operator-> NU pot fi funcții friend (trebuie să fie membri non-statici).')}</li>
            <li>{t('However, compound assignment operators (+=, -=, *=, etc.) CAN be implemented as friend functions.', 'Totuși, operatorii de atribuire compuși (+=, -=, *=, etc.) POT fi implementați ca funcții friend.')}</li>
          </ul>
        </Box>

        <Code>{`// operator= CANNOT be friend — this will not compile:
// friend bool operator= (Integer &i, int val); // Error C2801

// But += CAN be friend:
class Integer {
    int value;
public:
    Integer(int val) : value(val) {}
    friend bool operator+= (Integer &i, int val);
};

bool operator+=(Integer &i, int val) {
    i.value = val;
    return true;
}`}</Code>

        <Box type="warning">
          <p className="font-bold">{t('Reference vs Value in friend operators', 'Referință vs Valoare în operatorii friend')}</p>
          <p className="text-sm">{t('Be careful: if the friend operator takes the object by value (not reference), modifications are made on a copy and the original object is NOT changed.', 'Atenție: dacă operatorul friend primește obiectul prin valoare (nu referință), modificările se fac pe o copie iar obiectul original NU este schimbat.')}</p>
        </Box>

        <p className="font-bold mt-4">{t('Object Operations: Passing Objects to Functions', 'Operații cu obiecte: transmiterea obiectelor la funcții')}</p>
        <Box type="theorem">
          <p className="font-bold">{t('Parameter Passing Rules', 'Reguli de transmitere a parametrilor')}</p>
          <ul className="list-disc pl-5 text-sm space-y-1 mt-1">
            <li>{t('If the parameter is a reference/pointer — only its address is copied on the stack.', 'Dacă parametrul este referință/pointer — doar adresa sa este copiată pe stack.')}</li>
            <li>{t('If the parameter is an object — the entire object is copied on the stack. The compiler uses the copy constructor. If no copy constructor exists, a byte-by-byte copy (like memcpy) is generated.', 'Dacă parametrul este un obiect — întregul obiect este copiat pe stack. Compilatorul folosește constructorul de copiere. Dacă nu există constructor de copiere, se generează o copie byte-by-byte (ca memcpy).')}</li>
          </ul>
        </Box>

        <Code>{`class Date {
    int X, Y, Z, T;
public:
    Date(int value) : X(value), Y(value+1),
        Z(value+2), T(value+3) {}
    void SetX(int value) { X = value; }
};

// Pass by value: copy constructor called (or memcpy if none)
void Set(Date d, int value) {
    d.SetX(value); // modifies the COPY, not the original
}

// Pass by reference: no copy, original is modified
void Set(Date &d, int value) {
    d.SetX(value); // modifies the original
}`}</Code>

        <p className="font-bold mt-4">{t('Returning Objects from Functions', 'Returnarea obiectelor din funcții')}</p>
        <p className="text-sm">{t('When returning an object by value, the compiler creates a temporary object. What the compiler does behind the scenes:', 'La returnarea unui obiect prin valoare, compilatorul creează un obiect temporar. Ce face compilatorul în spate:')}</p>

        <Code>{`// What you write:
Date Get(int value) {
    Date d(value);
    return d;
}
void main() {
    Date d(1);
    d = Get(100);
}

// What the compiler generates (pseudocode):
Date* Get(Date *tempObject, int value) {
    Date d(value);
    memcpy(tempObject, &d, sizeof(Date)); // or copy constructor
    return tempObject;
}
void main() {
    Date d(1);
    unsigned char temp[sizeof(Date)];
    Date* tmpObj = Get(temp, 100);
    memcpy(d, tmpObj, sizeof(Date)); // or operator=
}`}</Code>

        <Box type="theorem">
          <p className="font-bold">{t('Move vs Copy Priority', 'Prioritatea mutare vs copiere')}</p>
          <p className="text-sm">{t('When dealing with temporary objects, the compiler always prefers: (1) Move constructor, (2) Move assignment — instead of copy constructor or simple assignment. These are preferred if they exist. If not, the copy constructor and assignment operator are used. Move semantics are ONLY used for temporary objects. For regular objects (references), copy constructor and assignment are preferred.', 'La lucrul cu obiecte temporare, compilatorul preferă întotdeauna: (1) Constructor de mutare, (2) Atribuire prin mutare — în loc de constructorul de copiere sau atribuire simplă. Acestea sunt preferate dacă există. Dacă nu, se folosesc constructorul de copiere și operatorul de atribuire. Semantica de mutare este folosită DOAR pentru obiecte temporare. Pentru obiecte obișnuite (referințe), constructorul de copiere și atribuirea sunt preferate.')}</p>
        </Box>

        <Box type="warning">
          <p className="font-bold">{t('Move Constructor Deletes Copy Constructor', 'Constructorul de mutare șterge constructorul de copiere')}</p>
          <p className="text-sm">{t('If a move constructor is present but no copy constructor, passing an object by value will fail to compile. The copy constructor is implicitly deleted when a move constructor is user-defined. You must add a copy constructor explicitly.', 'Dacă există un constructor de mutare dar nu un constructor de copiere, transmiterea unui obiect prin valoare nu va compila. Constructorul de copiere este șters implicit când un constructor de mutare este definit de utilizator. Trebuie să adăugați explicit un constructor de copiere.')}</p>
        </Box>

        <p className="font-bold mt-4">{t('Full Example: String class with copy/assign', 'Exemplu complet: clasa String cu copiere/atribuire')}</p>
        <Code>{`class String {
    char *text;
    void CopyString(const char *string) {
        text = new char[strlen(string) + 1];
        memcpy(text, string, strlen(string) + 1);
    }
public:
    String(const char *s) {
        CopyString(s);
    }
    ~String() {
        if (text != nullptr) {
            delete text;
        }
    }
    String(const String &obj) {
        CopyString(obj.text); // deep copy
    }
    String& operator=(const String &obj) {
        if (text != nullptr) {
            delete text;
            text = nullptr;
        }
        CopyString(obj.text); // deep copy
        return (*this);
    }
};

String Get(const char *text) {
    String s(text);
    return s;
}

void main() {
    String s("");
    s = Get("C++ test");
    // Flow: CTOR s -> CTOR Get::s -> COPY temp -> DTOR Get::s
    //    -> operator= on s -> DTOR temp -> DTOR s
}`}</Code>

        <Box type="formula">
          <p className="font-bold">{t('Object Lifecycle Summary', 'Rezumatul ciclului de viață al obiectelor')}</p>
          <ol className="list-decimal pl-5 text-sm space-y-1 mt-1">
            <li>{t('Constructor allocates memory for local object in function', 'Constructorul alocă memorie pentru obiectul local din funcție')}</li>
            <li>{t('Copy constructor copies local object to temporary object', 'Constructorul de copiere copiază obiectul local în obiectul temporar')}</li>
            <li>{t('Local object is destroyed (destructor called)', 'Obiectul local este distrus (destructorul apelat)')}</li>
            <li>{t('Assignment operator copies temp object to destination', 'Operatorul de atribuire copiază obiectul temporar la destinație')}</li>
            <li>{t('Temporary object is destroyed', 'Obiectul temporar este distrus')}</li>
          </ol>
          <p className="text-sm mt-2">{t('The string "C++ test" is allocated 3 times (for Get::s, temp_obj, and main::s). With move semantics, these extra copies can be eliminated.', 'Șirul "C++ test" este alocat de 3 ori (pentru Get::s, temp_obj și main::s). Cu semantica de mutare, aceste copii suplimentare pot fi eliminate.')}</p>
        </Box>

        <Toggle
          question={t('What is the difference between copy constructor and assignment operator when returning objects?', 'Care este diferența între constructorul de copiere și operatorul de atribuire la returnarea obiectelor?')}
          answer={t('The copy constructor is used to create a new temporary object from the function\'s return value. The assignment operator is used to copy that temporary object into an existing destination object. If a move constructor exists, the compiler prefers it over the copy constructor for temporary objects. If operator= exists, it is called instead of a byte-by-byte memcpy for the final assignment.', 'Constructorul de copiere este folosit pentru a crea un nou obiect temporar din valoarea returnată de funcție. Operatorul de atribuire este folosit pentru a copia acel obiect temporar într-un obiect destinație existent. Dacă există un constructor de mutare, compilatorul îl preferă față de constructorul de copiere pentru obiecte temporare. Dacă operator= există, este apelat în loc de un memcpy byte-by-byte pentru atribuirea finală.')}
        />
      </Section>
    </>
  );
}
