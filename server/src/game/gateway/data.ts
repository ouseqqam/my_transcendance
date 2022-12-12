export let ball = {
  position: { x: 0, y: 0, z: 1 },
  args: [1, 100, 100],
};

export let stage = {
  w: 40,
  h: 60,
  cLeft: {
    position: [-40 / 2, 0, 0.75],
    args: [1.5, 1.5, 61.5],
  },
  cRight: {
    position: [40 / 2, 0, 0.75],
    args: [1.5, 1.5, 61.5],
  },
  cTop: {
    position: [0, -60 / 2, 0.75],
    args: [1.5, 1.5, 40],
  },
  cBottom: {
    position: [0, 60 / 2, 0.75],
    args: [1.5, 1.5, 40],
  },
};

export let paddle1 = {
  position: { x: 0, y: -60 / 2 + 3, z: 0 },
  size: 40 / 5,
  height: 1.5,
  width: 2,
};

export let paddle2 = {
  position: { x: 0, y: 60 / 2 - 3, z: 0 },
  size: 40 / 5,
  height: 1.5,
  width: 2,
};
