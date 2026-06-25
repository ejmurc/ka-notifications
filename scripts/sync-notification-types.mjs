import { parse } from 'graphql';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SAFELIST_URL =
  'https://raw.githubusercontent.com/bhavjitChauhan/khan-api/safelist/query/getNotificationsForUser';

const OUTPUT_PATH = resolve(__dirname, '../src/types/notification.d.ts');

const FIELD_TYPES = {
  brandNew: 'boolean',
  read: 'boolean',
  flagged: 'boolean',
  coachIsParent: 'boolean',
  isMultipleClassrooms: 'boolean',
  numAssignments: 'number',
  numAssignmentsCount: 'number',
  masteryPercentage: 'number',
  sumVotesIncremented: 'number',
  badgeCategory: 'number',
  feedbackType: 'string',
};

function fieldType(name) {
  return FIELD_TYPES[name] ?? 'string';
}

function parseSelections(selections) {
  const fields = {};
  const spreads = [];
  for (const sel of selections) {
    if (sel.kind === 'Field') {
      const alias = sel.alias?.value ?? sel.name.value;
      if (sel.name.value === '__typename') {
        fields.__typename = '__typename';
      } else if (sel.selectionSet) {
        const [nestedFields] = parseSelections(sel.selectionSet.selections);
        fields[alias] = { nested: true, fields: nestedFields };
      } else {
        fields[alias] = fieldType(alias);
      }
    } else if (sel.kind === 'FragmentSpread') {
      spreads.push(sel.name.value);
    }
  }
  return [fields, spreads];
}

function renderNested(fields, depth = 2) {
  const pad = '  '.repeat(depth);
  const lines = [];
  for (const [fname, fval] of Object.entries(fields)) {
    if (fname === '__typename') continue;
    if (typeof fval === 'object') {
      lines.push(`${pad}${fname}: {`);
      lines.push(...renderNested(fval.fields, depth + 1));
      lines.push(`${pad}};`);
    } else {
      lines.push(`${pad}${fname}: ${fval};`);
    }
  }
  return lines;
}

async function main() {
  const gqlText = await fetch(SAFELIST_URL).then(r => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.text();
  });

  const doc = parse(gqlText);

  const fragments = {};
  let operation = null;
  for (const defn of doc.definitions) {
    if (defn.kind === 'FragmentDefinition') fragments[defn.name.value] = defn;
    else if (defn.kind === 'OperationDefinition') operation = defn;
  }

  const fragmentShapes = {};
  for (const [fname, fnode] of Object.entries(fragments)) {
    const [fields] = parseSelections(fnode.selectionSet.selections);
    fragmentShapes[fname] = { on: fnode.typeCondition.name.value, fields };
  }

  let outerNotifications = null;
  for (const sel of operation.selectionSet.selections) {
    if (sel.kind === 'Field' && sel.name.value === 'user') {
      for (const s2 of sel.selectionSet.selections) {
        if (s2.kind === 'Field' && s2.name.value === 'notifications') {
          outerNotifications = s2;
        }
      }
    }
  }

  let pageInfoFields = {};
  let notifField = null;
  for (const s of outerNotifications.selectionSet.selections) {
    if (s.kind === 'Field') {
      if (s.name.value === 'pageInfo')
        [pageInfoFields] = parseSelections(s.selectionSet.selections);
      if (s.name.value === 'notifications') notifField = s;
    }
  }

  const [baseFields, baseSpreads] = parseSelections(notifField.selectionSet.selections);
  const unionMembers = baseSpreads.map(s => fragmentShapes[s].on);

  const out = [];

  out.push('export interface BaseNotification {');
  for (const [fname, fval] of Object.entries(baseFields)) {
    if (fname === '__typename') out.push('  __typename: string;');
    else if (typeof fval === 'string') out.push(`  ${fname}: ${fval};`);
  }
  out.push('}');
  out.push('');

  for (const spreadName of baseSpreads) {
    const { on: onType, fields } = fragmentShapes[spreadName];
    out.push(`export interface ${onType} extends BaseNotification {`);
    out.push(`  __typename: "${onType}";`);
    for (const [fname, fval] of Object.entries(fields)) {
      if (fname === '__typename') continue;
      if (typeof fval === 'object') {
        out.push(`  ${fname}: {`);
        out.push(...renderNested(fval.fields, 2));
        out.push('  };');
      } else {
        out.push(`  ${fname}: ${fval};`);
      }
    }
    out.push('}');
    out.push('');
  }

  out.push('export type KhanAcademyNotification =');
  unionMembers.forEach((m, i) => out.push(`${i === 0 ? '    ' : '  | '}${m}`));
  out.push('  ;');
  out.push('');

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true });
  writeFileSync(OUTPUT_PATH, out.join('\n'), 'utf-8');
  console.log(`Generated ${unionMembers.length} types: ${OUTPUT_PATH}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
