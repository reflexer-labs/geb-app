const dates = [
  1588982400,
  1589587200,
  1590192000,
  1590796800,
  1591401600,
  1592006400,
  1592611200,
  1593216000,
  1593820800,
  1594425600,
  1595030400,
  1595635200,
  1596240000,
  1596844800,
  1597449600,
  1598054400,
  1598659200,
  1599264000,
  1599868800,
  1600473600,
  1601078400,
  1601683200,
  1602288000,
  1602633600,
];

const generateVolumes = () => {
  let num = Math.floor(Math.random() * 99) + 1;
  num *= Math.floor(Math.random() * 2) === 1 ? 1 : -1;
  return num / 2;
};

const generateData = () => {
  const data = dates.map((date: number) => {
    return {
      date,
      amount: Math.random() * 500000 + 50000,
      volume: generateVolumes(),
    };
  });
  return {
    data,
    amountToDisplay: data[data.length - 1].amount,
    averageTodaysRate: data[data.length - 1].volume,
  };
};

export default {
  generateData: generateData(),
};
