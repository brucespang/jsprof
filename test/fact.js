function fact(n) {
    if(n <= 0)
        return 1
    else
        return n*fact(n-1)
}

for(var i = 0; i < 10; i++)
    fact(i)
