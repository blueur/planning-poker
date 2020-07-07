export class Group {
    public name: string = "";
    public cards: string[] = [];
    public story: string = "";
    public members: string[] = [];
    public votes: object = {};
}

export class Member {
    public name: string;
    public vote: string = '';
}
