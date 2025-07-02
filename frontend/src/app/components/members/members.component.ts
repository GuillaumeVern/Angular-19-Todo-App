import { DragDropModule } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../models/user.model';
import { BackendService } from '../../service/backend.service';
import { UserSend } from '../../models/user.send.model';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-members',
  imports: [CommonModule, DragDropModule, FormsModule],
  templateUrl: './members.component.html',
  styleUrl: './members.component.css',
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ opacity: 0, transform: 'scale(0.9)' })),
      ]),
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateY(-20px)', opacity: 0 }),
        animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateY(-20px)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class MembersComponent implements OnInit{
  newUserName = '';
  newUserSurname = '';
  newUserEmail = '';
  members: User[] = [];
  backendService = inject(BackendService);
  editingMemberIndex: number | null = null;

  ngOnInit() {
    this.getAllMembers();
  }

  addMember() {
    if (this.newUserName && this.newUserSurname && this.newUserEmail) {
      const newMember: UserSend = {
        nom: this.newUserName,
        prenom: this.newUserSurname,
        email: this.newUserEmail
      };

      this.backendService.addMember(newMember).then(() => {
        this.getAllMembers();
        this.clearForm();
      }).catch(error => {
        console.error('Error adding member:', error);
      });
    }
  }

  getAllMembers() {
    this.backendService.getAllMembers().then((members: User[]) => {
      this.members = members;
      console.log('Members fetched successfully:', this.members);
    }).catch(error => {
      console.error('Error fetching members:', error);
    });
  }

  editMember(index: number) {
    this.editingMemberIndex = index;
  }

  saveMember(index: number) {
    const member: UserSend = {
      nom: this.members[index].nom,
      prenom: this.members[index].prenom,
      email: this.members[index].email
    };


    if (member.nom && member.prenom && member.email) {
      this.backendService.updateMember(member, this.members[index].id).then(() => {
        this.editingMemberIndex = null;
        this.getAllMembers();
      }).catch(error => {
        console.error('Error updating member:', error);
      });
    } else {
      alert('Please fill in all fields!');
    }
  }

  deleteMember(index: number) {
    const memberId = this.members[index].id;
    this.backendService.deleteMember(memberId).then(() => {
      this.members.splice(index, 1);
      console.log('Member deleted successfully');
    }).catch(error => {
      console.error('Error deleting member:', error);
    });
  }

  clearForm() {
    this.newUserName = '';
    this.newUserSurname = '';
    this.newUserEmail = '';
  }

}
