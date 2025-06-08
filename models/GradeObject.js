// Define the GradeObject class
class GradeObject {
  constructor(spec = {}) {
    this.threshold = spec.threshold ?? 0;
    this.grade = spec.grade ?? 'Z';
    this.title = spec.title ?? 'Title';
    this.description = spec.description ?? 'Description';
    this.emoji = spec.emoji ?? '👏';
  }
}

// prettier-ignore
const Grades = [
  new GradeObject({ threshold: 95, grade: 'S',  title: 'Drop Dynamo',       description: 'Flawless timing—unstoppable precision!', emoji: '🎯' }),
  new GradeObject({ threshold: 90, grade: 'A+', title: 'Stop Sage',         description: 'Elite-level reaction speed',             emoji: '🧘' }),
  new GradeObject({ threshold: 85, grade: 'A',  title: 'Zone Zealot',       description: 'Consistently landing in the sweet spot', emoji: '🔍' }),
  new GradeObject({ threshold: 80, grade: 'B+', title: 'Rapid Reacter',     description: 'Fast and reliable, on your way',         emoji: '⚡' }),
  new GradeObject({ threshold: 75, grade: 'B',  title: 'Decent Dropper',    description: 'Solid control, occasional missteps',     emoji: '📚' }),
  new GradeObject({ threshold: 70, grade: 'C+', title: 'Late Bloomer',      description: 'Slow reactions but improving',           emoji: '🌱' }),
  new GradeObject({ threshold: 65, grade: 'C',  title: 'Hesitant Handler',  description: 'Second-guessing leads to misses',        emoji: '🤷' }),
  new GradeObject({ threshold: 60, grade: 'D+', title: 'Silly Stopper',     description: 'Mostly missing the timing',              emoji: '🫳' }),
  new GradeObject({ threshold: 55, grade: 'D',  title: 'Chaotic Clicker',   description: 'More luck than skill',                   emoji: '🎲' }),
  new GradeObject({ threshold: 0, grade: 'F',   title: 'Miserable Masher',  description: 'Drop Disaster!',                         emoji: '💥' }),
];

// Export the class and Grades array for use in other modules
export { GradeObject, Grades };
