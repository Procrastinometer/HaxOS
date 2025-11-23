declare module 'haxball.js' {
  function HBInit(config: RoomConfig): RoomObject;

  const HaxballJS: Promise<typeof HBInit>;
  export = HaxballJS;
}