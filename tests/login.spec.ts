import { test, expect } from '@playwright/test';

// Saucedemo нь Playwright сурах зориулалттай нээлттэй демо онлайн дэлгүүр юм.
// Бүх тестийн өмнө нэг л веб хуудас руу орох тул beforeEach ашиглана - код давхардахгүй.
test.beforeEach(async ({ page }) => {
  await page.goto('https://www.saucedemo.com');
});

test.describe('Нэвтрэх хуудасны тестүүд', () => {

  // Тест 1: Амжилттай нэвтрэх
  test('зөв нэр, нууц үгээр амжилттай нэвтэрнэ', async ({ page }) => {
    // getByPlaceholder ашигласан - учир нь username/password талбарууд
    // ID эсвэл name биш, харин placeholder текстээрээ ялгардаг.
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();

    // Амжилттай нэвтэрсний дараа Products хуудас руу шилжинэ.
    // URL болон гарчгийг хоёуланг нь шалгаж баталгаажуулна.
    await expect(page).toHaveURL(/.*inventory.html/);
    await expect(page.getByText('Products')).toBeVisible();

    // Гарах товч (logout) харагдаж байгаа эсэхийг шалгах - тест зөв
    // төгсгөгдөх ёстой тул дараагийн алхамд ашиглагдана (Алхам 5).
    await page.locator('#react-burger-menu-btn').click();
    await expect(page.getByText('Logout')).toBeVisible();
  });

  // Тест 2: Амжилтгүй нэвтрэх (сөрөг тест)
  test('буруу нууц үгээр нэвтрэхэд алдааны мессеж гарна', async ({ page }) => {
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('wrong_password');
    await page.getByRole('button', { name: 'Login' }).click();

    // Алдааны мессеж нь data-test="error" атрибуттай тул getByTestId
    // ашиглах нь хамгийн тогтвортой (текст өөрчлөгдсөн ч тест эвдэрэхгүй).
    const errorMessage = page.locator('[data-test="error"]');
    await expect(errorMessage).toBeVisible();
    await expect(errorMessage).toContainText('Username and password do not match');

    // Нэвтэрч чадаагүй тул хэрэглэгч нэвтрэх хуудсандаа үлдэх ёстой.
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

  // Тест 3: Нэвтэрсний дараах үйлдэл - бараа сагслах
  test('нэвтэрсний дараа бараа сагсанд нэмж чадна', async ({ page }) => {
    await page.getByPlaceholder('Username').fill('standard_user');
    await page.getByPlaceholder('Password').fill('secret_sauce');
    await page.getByRole('button', { name: 'Login' }).click();

    // getByRole ашиглаж нэгдүгээр барааг сагслах товчийг олно.
    // XPath-аас зайлсхийсэн: XPath нь HTML бүтэц өөрчлөгдмөгц эвдэрдэг
    // бол getByRole/getByTestId нь хэрэглэгчийн харж буй элементийн
    // утга учир дээр суурилдаг тул илүү тогтвортой, унших боломжтой.
    await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

    // Сагсны icon дээрх тоо 1 болсныг шалгана.
    const cartBadge = page.locator('.shopping_cart_badge');
    await expect(cartBadge).toHaveText('1');

    // Сагс руу орж, барааны нэр зөв харагдаж байгааг баталгаажуулна.
    await page.locator('.shopping_cart_link').click();
    await expect(page.getByText('Sauce Labs Backpack')).toBeVisible();

    // Тест изоляц: тест бүр бие даан ажиллах ёстой тул энд гарах
    // (logout) үйлдлээр төгсгөнө.
    await page.locator('#react-burger-menu-btn').click();
    await page.getByText('Logout').click();
    await expect(page).toHaveURL('https://www.saucedemo.com/');
  });

});