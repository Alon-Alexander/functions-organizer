export const wrapper = () => 
{
    return () => {
        x();
    }
}

var x = (hello) => {hello();
}