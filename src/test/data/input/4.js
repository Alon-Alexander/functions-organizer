console.log('hello');
function caller(func = () => {
    console.log('this is the default function');
}) {
    func();

}


const func = () => {
    console.log('this is func');}
caller(func);