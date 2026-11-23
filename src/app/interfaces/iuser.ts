/**
 * A contact from the "contacts" table.
 */
export interface IUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
}
