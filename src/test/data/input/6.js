var x = (hello) => {hello();
}

export const wrapper = () => 
{
    return () => {
        x();
    }
}