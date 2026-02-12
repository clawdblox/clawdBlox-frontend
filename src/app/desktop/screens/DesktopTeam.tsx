import { useState, useEffect } from 'react';
import { MacCard, MacTable, MacTableRow } from '../components/MacUI';
import { Mail, Shield, Trash2, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTeamStore } from '../../../stores/team.store';

export function DesktopTeam() {
  const teamStore = useTeamStore();
  const [showInvite, setShowInvite] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'editor' | 'viewer'>('viewer');

  useEffect(() => {
    teamStore.fetchMembers();
  }, []);

  const handleCreate = async () => {
    if (!newEmail || !newName || !newPassword) {
      toast.error('All fields are required');
      return;
    }
    const user = await teamStore.createMember({
      email: newEmail,
      display_name: newName,
      password: newPassword,
      role: newRole,
    });
    if (user) {
      toast.success(`${user.display_name} added to team`);
      setShowInvite(false);
      setNewEmail('');
      setNewName('');
      setNewPassword('');
      setNewRole('viewer');
    } else {
      toast.error(teamStore.error ?? 'Creation failed');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await teamStore.deleteMember(id);
    if (ok) {
      toast.success(`${name} removed from team`);
    } else {
      toast.error(teamStore.error ?? 'Deletion failed');
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-[1000px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-[28px] font-bold text-white tracking-tight">Team</h2>
          <p className="text-[#8E8E93] text-[15px]">Manage access to your dashboard</p>
        </div>
        <button
          onClick={() => setShowInvite(!showInvite)}
          className="flex items-center gap-2 px-4 py-2 bg-[#05b6f8] hover:bg-[#0498d0] text-white rounded-lg font-semibold transition-colors shadow-lg shadow-[#05b6f8]/20"
        >
          <UserPlus size={18} /> Invite
        </button>
      </div>

      {/* Invite Form */}
      {showInvite && (
        <MacCard className="p-5">
          <h3 className="text-[15px] font-semibold text-white mb-4">New member</h3>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Display name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="px-3 py-2 bg-[#2C2C2E] border border-[#38383A] rounded-lg text-white text-[14px] outline-none focus:border-[#05b6f8]"
            />
            <input
              type="email"
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="px-3 py-2 bg-[#2C2C2E] border border-[#38383A] rounded-lg text-white text-[14px] outline-none focus:border-[#05b6f8]"
            />
            <input
              type="password"
              placeholder="Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="px-3 py-2 bg-[#2C2C2E] border border-[#38383A] rounded-lg text-white text-[14px] outline-none focus:border-[#05b6f8]"
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as 'admin' | 'editor' | 'viewer')}
              className="px-3 py-2 bg-[#2C2C2E] border border-[#38383A] rounded-lg text-white text-[14px] outline-none focus:border-[#05b6f8]"
            >
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
            </select>
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <button
              onClick={() => setShowInvite(false)}
              className="px-4 py-2 text-[#8E8E93] hover:text-white text-[13px] transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-[#05b6f8] hover:bg-[#0498d0] text-white text-[13px] font-semibold rounded-lg transition-colors"
            >
              Add
            </button>
          </div>
        </MacCard>
      )}

      {teamStore.isLoading && teamStore.members.length === 0 ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="text-[#05b6f8] animate-spin" />
        </div>
      ) : (
        <MacCard>
          <MacTable headers={['Member', 'Email', 'Role', 'Actions']}>
            {teamStore.members.map((member) => (
              <MacTableRow key={member.id}>
                <div className="flex-1 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#2C2C2E] flex items-center justify-center text-[13px] font-bold text-white border border-[#38383A]">
                    {member.display_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-[15px] font-medium text-white">{member.display_name}</span>
                </div>

                <div className="flex-1 text-[#8E8E93] text-[14px] flex items-center gap-2">
                  <Mail size={14} /> {member.email}
                </div>

                <div className="flex-1">
                  <span className={`
                    inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] font-medium border
                    ${member.role === 'owner' ? 'bg-[#05b6f8]/10 text-[#05b6f8] border-[#05b6f8]/20' :
                      member.role === 'admin' ? 'bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/20' :
                      member.role === 'editor' ? 'bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20' :
                      'bg-[#8E8E93]/10 text-[#8E8E93] border-[#8E8E93]/20'}
                  `}>
                    <Shield size={10} />
                    {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                  </span>
                </div>

                <div className="flex items-center">
                  {member.role !== 'owner' && (
                    <button
                      onClick={() => handleDelete(member.id, member.display_name)}
                      className="p-2 text-[#8E8E93] hover:text-[#FF453A] rounded-lg hover:bg-white/10 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </MacTableRow>
            ))}
          </MacTable>
        </MacCard>
      )}
    </div>
  );
}
