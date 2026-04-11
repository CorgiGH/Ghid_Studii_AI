#include <iostream>
#include "CircularString.h"
using namespace std;

int main()
{
    CircularString c('*', 5);
    cout << (const char*)c << endl;
    ((c += 'a') += 'b') += 'c';
    cout << (const char*)c << endl;
    c++;
    cout << (const char*)c << endl;
    c++; c++; c++;
    cout << (const char*)c << endl;
    --c;
    cout << (const char*)c << endl;
    int len = (int)c;
    for (int tr = 0; tr < len; tr++) { cout << c[tr] << ","; }
    cout << endl << "Len = " << len << endl;
    cout << "Ascii codes: ";
    for (int tr = 0; tr < 10; tr++) {
        cout << c(tr) << ",";
    }
    return 0;
}

