import DataTable from '../../components/ui/DataTable';
import CrudForm from '../../components/ui/CrudForm';
import { useFetch } from '../../hooks/useFetch';
import { getBranches, createBranch, updateBranch, deleteBranch } from '../../api/branches';

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'location', label: 'Location' },
];

const fields = [
  { key: 'name', label: 'Branch name', required: true },
  { key: 'location', label: 'Address (for Google Maps)', required: true, placeholder: 'E.g.: Tashkent, Chilanzar, Bunyodkor street 1' },
];

export default function AdminBranches() {
  const { data, loading, error, refetch } = useFetch(getBranches);

  return (
    <DataTable
      title="Branches"
      data={data || []}
      loading={loading}
      error={error}
      columns={columns}
      searchFields={['name', 'location']}
      renderForm={(editing, onClose) => (
        <CrudForm
          fields={fields}
          initialData={editing}
          onSubmit={async (id, form) => {
            if (editing) {
              await updateBranch(id, form);
            } else {
              await createBranch(form);
            }
            refetch();
          }}
          onClose={onClose}
        />
      )}
    />
  );
}