export type Task = {
  task: string;
  points: number;
  used: number;
};

export type Category = {
  name: string;
  tasks: Task[];
};

export type EventData = {
  name: string;
  categories: Category[];
};

export type TablesData = {
  events: EventData[];
};
