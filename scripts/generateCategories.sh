echo '{"articles":[' > 'editorial/latest/latest.json'
for catFOLDER in editorial/*; do
    category="$(basename -- $catFOLDER)"
    if [ $category != "latest" ]; then
        echo '{"articles":[' > $catFOLDER'/'$category'.json'
        for jsonFILE in $catFOLDER/articles/*.json; do
            jsonCATEGORY=$(grep -o '"category":"[^"]*' $jsonFILE | grep -o '[^"]*$');
            jsonTITLE=$(grep -o '"title":"[^"]*' $jsonFILE | grep -o '[^"]*$');
            jsonEXCERPT=$(grep -o '"excerpt":"[^"]*' $jsonFILE | grep -o '[^"]*$');
            jsonDATE=$(grep -o '"date":"[^"]*' $jsonFILE | grep -o '[^"]*$');
            jsonMEMBER=$(grep -o '"membersOnly":"[^"]*' $jsonFILE | grep -o '[^"]*$');
            jsonFEATURE=$(grep -o '"featuredContent":\[{.*\"}\]\,"*' $jsonFILE | grep -o '\[{.*"}\]');
            echo '{"docref":"'$jsonFILE'","category":"'$jsonCATEGORY'","title":"'$jsonTITLE'","excerpt":"'$jsonEXCERPT'","date":"'$jsonDATE'","membersOnly":"'$jsonMEMBER'","featuredContent":'$jsonFEATURE'},' >> $catFOLDER/$category.json
            echo '{"docref":"'$jsonFILE'","category":"'$jsonCATEGORY'","title":"'$jsonTITLE'","excerpt":"'$jsonEXCERPT'","date":"'$jsonDATE'","membersOnly":"'$jsonMEMBER'","featuredContent":'$jsonFEATURE'},' >> 'editorial/latest/latest.json'
        done;
        # save category.json
        tail -n1 $catFOLDER/$category.json | grep --line-buffered --color '},$' | sed -ue 's/},$/}/g' > $catFOLDER/tmpTAIL.txt
        cat $catFOLDER/$category.json | sed '$ d' > $catFOLDER/tmpHEAD.txt
        cat $catFOLDER/tmpHEAD.txt $catFOLDER/tmpTAIL.txt > $catFOLDER/tmp$category.txt
        rm $catFOLDER/tmpHEAD.txt $catFOLDER/tmpTAIL.txt
        mv $catFOLDER/tmp$category.txt $catFOLDER/$category.json
        echo ']}' >> $catFOLDER/$category.json
    fi
done
# save latest.json
tail -n1 'editorial/latest/latest.json' | grep --line-buffered --color '},$' | sed -ue 's/},$/}/g' > 'editorial/latest/tmpLatestTAIL.txt'
cat 'editorial/latest/latest.json' | sed '$ d' > 'editorial/latest/tmpLatestHEAD.txt'
cat 'editorial/latest/tmpLatestHEAD.txt' 'editorial/latest/tmpLatestTAIL.txt' > 'editorial/latest/tmpLATEST.txt'
rm 'editorial/latest/tmpLatestHEAD.txt' 'editorial/latest/tmpLatestTAIL.txt'
mv 'editorial/latest/tmpLATEST.txt' 'editorial/latest/latest.json'
echo ']}' >> 'editorial/latest/latest.json'