const { test, expectLoaded, expectPage } = require("@excaliburjs/testing");

test('Vite template', async () => {
    await expectLoaded();

    await expectPage('main page', './test/images/actual.png').toBe('./test/images/expected.png');
});