int main()
{
    BANK_ACCOUNT my_account;

    my_account += "210";
    my_account += 411.99;
    my_account += 455;
    my_account += 300;
    my_account += 607.25;
    my_account += "1210";    

    for (auto it : my_account)
    {
        cout << it->GetValue();
        if (dynamic_cast<EUR*>(it) != 0)
            cout << " EUR";
        else
            if (dynamic_cast<RON*>(it) != 0)
                cout << " RON";
            else
                cout << " USD";
        cout << endl;
    }

    cout << "In my multi bank account I have ";
    my_account.PrintCoinAmmount([](COIN* param)->bool {
        return dynamic_cast<USD*>(param) != 0;
        });
    cout << " $ and ";
    my_account.PrintCoinAmmount([](COIN* param)->bool {
        return dynamic_cast<RON*>(param) != 0;
        });
    cout << " RON" << endl;
    return 0;
}
