#include <iostream>
#include "Students.h"
#include "BestRomana.h"
#include "AverageMath.h"

int main()
{
    Students s({{"Dan",10,9},{"John",9,4},{"Mike", 5,8}});
    (s += new AverageMath())+=new BestRomana();
    s.print_all();
    s.analyze("AverageMath");
    s.analyze("BestRomana");
    return 0;
}


