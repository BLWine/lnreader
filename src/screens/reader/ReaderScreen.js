import React, {useState, useEffect, useRef} from 'react';
import {StyleSheet, View, ActivityIndicator} from 'react-native';

import {getChapters} from '../../database/queries/ChapterQueries';
import {useReaderSettings, useSettings, useTheme} from '../../hooks/reduxHooks';

import PagerView from 'react-native-pager-view';
import {Portal} from 'react-native-paper';

import ReaderChapter from './ReaderChapter';
import ReaderBottomSheet from './components/ReaderBottomSheet/ReaderBottomSheet';
import {useDispatch} from 'react-redux';
import {readerBackground} from './utils/readerStyles';
import {LoadingScreen} from '../../components/LoadingScreen/LoadingScreen';

const Chapter = ({route, navigation}) => {
  const {
    sourceId,
    chapterId,
    chapterUrl,
    novelId,
    novelUrl,
    novelName,
    chapterName,
    bookmark,
  } = route.params;

  const theme = useTheme();

  const {
    showScrollPercentage = true,
    fullScreenMode = true,
    swipeGestures = true,
    textSelectable = false,
    useWebViewForChapter = false,
    showBatteryAndTime = false,
    autoScroll = false,
    verticalSeekbar = true,
  } = useSettings();

  let readerSheetRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState([]);

  const dispatch = useDispatch();
  const reader = useReaderSettings();

  const getChaptersFromDb = async () => {
    const data = await getChapters(novelId);

    setChapters(data);
    setLoading(false);
  };

  useEffect(() => {
    getChaptersFromDb();
  }, []);

  const [position, setPosition] = useState(
    chapters.findIndex(i => i.chapterId === chapterId),
  );

  const onPageSelected = e => {
    setPosition(e.nativeEvent.position);
  };

  const pages =
    !loading &&
    chapters.map((chapter, index) => (
      <View key={chapter.chapterId}>
        {position === index ? (
          <ReaderChapter
            item={chapter}
            sourceId={sourceId}
            novelId={novelId}
            novelName={novelName}
            novelUrl={novelUrl}
            readerSheetRef={readerSheetRef}
            navigation={navigation}
          />
        ) : null}
      </View>
    ));

  const backgroundColor = readerBackground(reader.theme);

  return loading ? (
    <View style={{flex: 1, backgroundColor}}>
      <LoadingScreen theme={theme} />
    </View>
  ) : (
    <>
      <PagerView
        style={{flex: 1, backgroundColor}}
        initialPage={chapters.findIndex(i => i.chapterId === chapterId)}
        onPageSelected={onPageSelected}
        orientation="vertical"
      >
        {pages}
      </PagerView>
      <Portal>
        <ReaderBottomSheet
          theme={theme}
          reader={reader}
          dispatch={dispatch}
          navigation={navigation}
          bottomSheetRef={readerSheetRef}
          verticalSeekbar={verticalSeekbar}
          selectText={textSelectable}
          autoScroll={autoScroll}
          useWebViewForChapter={useWebViewForChapter}
          showScrollPercentage={showScrollPercentage}
          showBatteryAndTime={showBatteryAndTime}
          fullScreenMode={fullScreenMode}
          swipeGestures={swipeGestures}
        />
      </Portal>
    </>
  );
};

export default Chapter;

const styles = StyleSheet.create({});
