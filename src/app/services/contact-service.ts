import { Service, signal, inject, computed } from '@angular/core';
import { IUser } from '../interfaces/iuser';
// import { User } from ' .. /components/models/user';
// import { Toast, ToastType } from './toast';
import { Supabase } from './supabase';
// import { TasksService } from './tasks-service';

@Service()
export class ContactService {
    supabase = inject(Supabase).supabase;
    // toastService = inject(Toast);
    // taskService = inject(TasksService);
    userList: IUser[] = [];

    users = signal<IUser[]>([]);
    selectedUserID = signal<number | null>(null);

    // constructor() {
    //     this.getUsers();

    //     ngOnDestroy() {
    //         this.supabase.removeChannel(this.channelUserInsert);
    //         this.supabase.removeChannel(this.channelUserUpdate);
    //         this.supabase.removeChannel(this.channelUserDelete);

    //         sortUsers() {
    //             if (!this.userList) {
    //                 return;

    //                 this.userList.sort((a, b) => a.name.localeCompare(b.name));
    }