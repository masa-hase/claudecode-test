import { expect, test } from '@playwright/test';

test.describe('MySQL Analyzer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('MySQL EXPLAIN分析ツール');
  });

  test('should show analyze button disabled when input is empty', async ({ page }) => {
    const analyzeButton = page.getByRole('button', { name: '分析する' });
    await expect(analyzeButton).toBeDisabled();
  });

  test('should enable analyze button when input has content', async ({ page }) => {
    const textarea = page.getByPlaceholder(/MySQLのEXPLAIN結果を/);
    await textarea.fill('test input');

    const analyzeButton = page.getByRole('button', { name: '分析する' });
    await expect(analyzeButton).toBeEnabled();
  });

  test('should analyze valid EXPLAIN result', async ({ page }) => {
    const validExplain = `+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows | filtered | Extra |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------+
|  1 | SIMPLE      | users | NULL       | ALL  | NULL          | NULL | NULL    | NULL | 1000 |   100.00 | NULL  |
+----+-------------+-------+------------+------+---------------+------+---------+------+------+----------+-------+`;

    const textarea = page.getByPlaceholder(/MySQLのEXPLAIN結果を/);
    await textarea.fill(validExplain);

    const analyzeButton = page.getByRole('button', { name: '分析する' });
    await analyzeButton.click();

    // Wait for results to appear
    await expect(page.getByText('解析結果')).toBeVisible();
    await expect(page.getByRole('cell', { name: 'users' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'SIMPLE' })).toBeVisible();
    await expect(page.getByRole('cell', { name: '1000' })).toBeVisible();
  });

  test('should show error for invalid EXPLAIN result', async ({ page }) => {
    const textarea = page.getByPlaceholder(/MySQLのEXPLAIN結果を/);
    await textarea.fill('Invalid EXPLAIN result');

    const analyzeButton = page.getByRole('button', { name: '分析する' });
    await analyzeButton.click();

    // Wait for error message
    await expect(page.getByText('Invalid EXPLAIN format')).toBeVisible();
  });

  test('should display tuning suggestions for problematic queries', async ({ page }) => {
    const problematicExplain = `+----+-------------+-------+------------+------+---------------+------+---------+------+-------+----------+-----------------------------+
| id | select_type | table | partitions | type | possible_keys | key  | key_len | ref  | rows  | filtered | Extra                       |
+----+-------------+-------+------------+------+---------------+------+---------+------+-------+----------+-----------------------------+
|  1 | SIMPLE      | users | NULL       | ALL  | idx_email     | NULL | NULL    | NULL | 10000 |   100.00 | Using where; Using filesort |
+----+-------------+-------+------------+------+---------------+------+---------+------+-------+----------+-----------------------------+`;

    const textarea = page.getByPlaceholder(/MySQLのEXPLAIN結果を/);
    await textarea.fill(problematicExplain);

    const analyzeButton = page.getByRole('button', { name: '分析する' });
    await analyzeButton.click();

    // Wait for suggestions to appear
    await expect(page.getByText('チューニング提案')).toBeVisible();
    await expect(page.getByText('フルテーブルスキャン')).toBeVisible();
    await expect(page.getByText('重要')).toBeVisible();
  });

  test('should show optimal message for well-optimized queries', async ({ page }) => {
    const optimalExplain = `+----+-------------+-------+------------+-------+---------------+---------+---------+-------+------+----------+-------+
| id | select_type | table | partitions | type  | possible_keys | key     | key_len | ref   | rows | filtered | Extra |
+----+-------------+-------+------------+-------+---------------+---------+---------+-------+------+----------+-------+
|  1 | SIMPLE      | users | NULL       | const | PRIMARY       | PRIMARY | 4       | const |    1 |   100.00 | NULL  |
+----+-------------+-------+------------+-------+---------------+---------+---------+-------+------+----------+-------+`;

    const textarea = page.getByPlaceholder(/MySQLのEXPLAIN結果を/);
    await textarea.fill(optimalExplain);

    const analyzeButton = page.getByRole('button', { name: '分析する' });
    await analyzeButton.click();

    // Wait for optimal message
    await expect(page.getByText('現在のクエリは最適化されています。')).toBeVisible();
  });

  test('should handle vertical format EXPLAIN results', async ({ page }) => {
    const verticalExplain = `*************************** 1. row ***************************
           id: 1
  select_type: SIMPLE
        table: users
   partitions: NULL
         type: range
possible_keys: idx_age
          key: idx_age
      key_len: 5
          ref: NULL
         rows: 500
     filtered: 50.00
        Extra: Using where`;

    const textarea = page.getByPlaceholder(/MySQLのEXPLAIN結果を/);
    await textarea.fill(verticalExplain);

    const analyzeButton = page.getByRole('button', { name: '分析する' });
    await analyzeButton.click();

    // Wait for results
    await expect(page.getByText('解析結果')).toBeVisible();

    // Check that the table contains expected data
    const tableRows = page.locator('tbody tr');
    await expect(tableRows).toHaveCount(1);

    // Verify key columns contain expected values
    await expect(page.getByRole('cell', { name: 'users' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'range' })).toBeVisible();
  });

  test('should handle CSV format EXPLAIN results', async ({ page }) => {
    const csvExplain = `"id","select_type","table","partitions","type","possible_keys","key","key_len","ref","rows","filtered","Extra"
"1","SIMPLE","products","NULL","range","idx_price,idx_category","idx_price","5","NULL","2500","50.00","Using where; Using filesort"`;

    const textarea = page.getByPlaceholder(/MySQLのEXPLAIN結果を/);
    await textarea.fill(csvExplain);

    const analyzeButton = page.getByRole('button', { name: '分析する' });
    await analyzeButton.click();

    // Wait for results
    await expect(page.getByText('解析結果')).toBeVisible();

    // Verify the data is parsed correctly
    await expect(page.getByRole('cell', { name: 'products' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'range' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'idx_price', exact: true })).toBeVisible();
    await expect(page.getByRole('cell', { name: '2500' })).toBeVisible();

    // Should show suggestions for filesort
    await expect(page.getByText('チューニング提案')).toBeVisible();
    await expect(page.getByText('ファイルソート')).toBeVisible();
  });
});
