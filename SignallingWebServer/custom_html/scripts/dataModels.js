// Enumns
export class MenuContent {
    static Help = new MenuContent("Help");
    static RoomOptions = new MenuContent("RoomOptions");
    static DaylightSlider = new MenuContent("DaylightSlider");

    constructor(name) {
        this.name = name;
    }
    toString() {
        return `menuContent.${this.name}`;
    }
}

export class ScoreType {
    static Daylight = new ScoreType("Daylight");
    static Ventilation = new ScoreType("Ventilation");
    static AirRenewalTimes = new ScoreType("AirRenewalTimes");

    constructor(name) {
        this.name = name;
    }
    toString() {
        return `scoreType.${this.name}`;
    }
}

// Data models
export class Project {
    constructor(id, name, rooms) {
        this.id = id;
        this.name = name;
        this.rooms = rooms;
    }
}

export class Room {
    constructor(name, daylightScore, ventilationScore, airRenewalTime) {
        this.name = name;
        this.daylightScore = daylightScore;
        this.ventilationScore = ventilationScore;
        this.airRenewalTime = airRenewalTime;
    }
}
