#include <iostream>
#include "CharSet.h"

using namespace std;

int main()
{
    CharSet c1;
    CharSet c2 = "aabbccdd";
    ((c1 += 'a') += 'b') += 'e';
    cout << "c1 has " << (int)c1 << " elements !" << endl;
    cout << "c2 has " << (int)c2 << " elements !" << endl;
    CharSet c3 = c1 | c2;
    cout << "Union(c1,c2)=";
    c3.print();
    CharSet c4 = c1 & c2;
    cout << "Intersection(c1,c2)=";
    c4.print();
    cout << "c1 has 'a' : " << boolalpha << c1['a'] << endl;
    cout << "c1 has 'z' : " << boolalpha << c1['z'] << endl;
    cout << "c2 is ";
    c2.print();
    cout << "c2 has " << c2("adfg") << " characters from the set 'adfg' " << endl;
}
