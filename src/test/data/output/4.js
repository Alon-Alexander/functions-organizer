console.log('hello');
const func = () => {
    console.log('this is func');}


function caller(func = () => {
    console.log('this is the default function');
}) {
    func();

}
caller(func);