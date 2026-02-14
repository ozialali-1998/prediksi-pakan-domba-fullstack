const transpose = (matrix) => matrix[0].map((_, colIndex) => matrix.map((row) => row[colIndex]));

const multiply = (a, b) => {
  const rows = a.length;
  const cols = b[0].length;
  const inner = b.length;
  const result = Array.from({ length: rows }, () => Array(cols).fill(0));

  for (let i = 0; i < rows; i += 1) {
    for (let j = 0; j < cols; j += 1) {
      let total = 0;
      for (let k = 0; k < inner; k += 1) {
        total += a[i][k] * b[k][j];
      }
      result[i][j] = total;
    }
  }

  return result;
};

const invert = (matrix) => {
  const n = matrix.length;
  const augmented = matrix.map((row, i) => [
    ...row,
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))
  ]);

  for (let i = 0; i < n; i += 1) {
    let pivot = augmented[i][i];

    if (Math.abs(pivot) < 1e-10) {
      for (let r = i + 1; r < n; r += 1) {
        if (Math.abs(augmented[r][i]) > 1e-10) {
          [augmented[i], augmented[r]] = [augmented[r], augmented[i]];
          pivot = augmented[i][i];
          break;
        }
      }
    }

    if (Math.abs(pivot) < 1e-10) {
      throw new Error('Matriks tidak dapat diinversi. Data historis kurang bervariasi.');
    }

    for (let c = 0; c < 2 * n; c += 1) {
      augmented[i][c] /= pivot;
    }

    for (let r = 0; r < n; r += 1) {
      if (r === i) continue;
      const factor = augmented[r][i];
      for (let c = 0; c < 2 * n; c += 1) {
        augmented[r][c] -= factor * augmented[i][c];
      }
    }
  }

  return augmented.map((row) => row.slice(n));
};

const toFeatureRow = ({ month, jumlah, konsumsi }) => [1, Number(month), Number(jumlah), Number(konsumsi)];

const trainMultipleLinearRegression = (historicalRows) => {
  const x = historicalRows.map((row) =>
    toFeatureRow({ month: row.month, jumlah: row.jumlah, konsumsi: row.konsumsi })
  );
  const y = historicalRows.map((row) => [Number(row.actualNeed)]);

  const xt = transpose(x);
  const xtx = multiply(xt, x);
  const lambda = 1e-6;
  const regularizedXtx = xtx.map((row, i) => row.map((value, j) => (i === j ? value + lambda : value)));
  const xtxInv = invert(regularizedXtx);
  const xty = multiply(xt, y);
  const betaMatrix = multiply(xtxInv, xty);

  return betaMatrix.map((row) => row[0]);
};

const predictValue = (beta, input) => {
  const x = toFeatureRow(input);
  const value = x.reduce((sum, current, index) => sum + current * beta[index], 0);
  return Number(value.toFixed(2));
};

const calculateMape = (historicalRows, beta) => {
  const percentageErrors = historicalRows
    .filter((row) => Number(row.actualNeed) !== 0)
    .map((row) => {
      const predicted = predictValue(beta, row);
      return Math.abs((Number(row.actualNeed) - predicted) / Number(row.actualNeed)) * 100;
    });

  if (percentageErrors.length === 0) return 0;

  const mape = percentageErrors.reduce((sum, value) => sum + value, 0) / percentageErrors.length;
  return Number(mape.toFixed(2));
};

const interpretMape = (mape) => {
  if (mape < 10) return 'Sangat Baik';
  if (mape < 20) return 'Baik';
  if (mape < 50) return 'Cukup';
  return 'Buruk';
};

module.exports = {
  trainMultipleLinearRegression,
  predictValue,
  calculateMape,
  interpretMape
};
