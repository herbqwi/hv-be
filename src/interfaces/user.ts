export namespace Users {
  export interface IUser {
    id: number,
    email: string,
    password: string | null,
    first_name: string | null,
    last_name: string | null,
    phone_number: string | null
  }
    
  export interface IGoogleUser {
      email: string,
      given_name: string,
      family_name: string,
      picture: string,
      status?: string,
  }
}