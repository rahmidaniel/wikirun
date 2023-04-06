export const themeIsDark = () => {
    const storedTheme = localStorage.getItem('theme');
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

    return storedTheme === 'dark' || (!storedTheme && systemTheme);
}