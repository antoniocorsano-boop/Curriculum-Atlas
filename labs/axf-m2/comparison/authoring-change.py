"""M2-D: single authored coordinate change; no engine-specific source edits."""
import pathlib, sys, xml.etree.ElementTree as ET, json
source, target = map(pathlib.Path, sys.argv[1:3])
tree=ET.parse(source)
obj=tree.find("./objectgroup[@name='interactions']/object[@name='quaderno']")
assert (obj.get('x'),obj.get('y'))==('42','42')
obj.set('y','170')
tree.write(target,encoding='utf-8',xml_declaration=True)
print(json.dumps({'object':'quaderno','before':[42,42],'after':[42,170],'authoredFieldCount':1}))
