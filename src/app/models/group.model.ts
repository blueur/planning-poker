export class Group {
    public id: string;
    public name: string = "";
    public cards: string[] = [];
    public story: string = "";
}

export class Member {
    public id: string;
    public name: string;
    public vote: string;
}
